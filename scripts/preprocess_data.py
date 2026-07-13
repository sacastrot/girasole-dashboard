# -*- coding: utf-8 -*-
"""
Preprocesamiento de datos de Girasole para el Dashboard plan de expansión ISA.

Este script:

1. Lee los cuatro CSV de veredas de influencia (uno por proyecto).
2. Valida exhaustivamente cada columna según las reglas de negocio.
3. Interpreta las columnas tipo diccionario (RUNAP_CATEGORIA, RUNAP_NOMBRE,
   CONSEJO_COMUNITARIO, RESGUARDO_INDIGENA) y genera campos derivados.
4. Repara, simplifica y reproyecta las geometrías de EPSG:9377 a EPSG:4326.
5. Genera un GeoJSON por proyecto y un manifest.json en public/data/.

El script se ejecuta únicamente en el equipo de desarrollo. GitHub Pages
solo sirve los archivos estáticos ya generados en public/data/.

Uso:
    python scripts/preprocess_data.py
"""

from __future__ import annotations

import ast
import json
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path

import geopandas as gpd
import numpy as np
import pandas as pd
from shapely import wkt as shapely_wkt
from shapely.validation import make_valid

sys.path.insert(0, str(Path(__file__).resolve().parent))
import config  # noqa: E402


class ValidationError(Exception):
    """Error de validación de datos que detiene el proceso por completo."""


# ---------------------------------------------------------------------------
# Utilidades de reporte
# ---------------------------------------------------------------------------

def _falla(mensaje: str, *, archivo: str = None, fila: int = None,
           codigo: str = None, vereda: str = None, columna: str = None,
           valor=None) -> None:
    """Construye un mensaje de error uniforme y lanza ValidationError."""
    partes = [mensaje]
    if archivo is not None:
        partes.append(f"Archivo: {archivo}")
    if fila is not None:
        partes.append(f"Fila (0-indexada en el CSV, sin encabezado): {fila}")
    if codigo is not None:
        partes.append(f"VER_CCDGO: {codigo}")
    if vereda is not None:
        partes.append(f"VEREDA: {vereda}")
    if columna is not None:
        partes.append(f"Columna: {columna}")
    if valor is not None or valor == 0:
        partes.append(f"Valor encontrado: {valor!r}")
    raise ValidationError("\n  ".join(partes))


def _contexto_fila(df: pd.DataFrame, idx: int) -> dict:
    fila = df.loc[idx]
    return {
        "codigo": fila.get(config.COLUMNA_CODIGO_VEREDA),
        "vereda": fila.get("VEREDA"),
    }


# ---------------------------------------------------------------------------
# Lectura y validación estructural
# ---------------------------------------------------------------------------

def leer_csv(proyecto: dict) -> pd.DataFrame:
    ruta = config.RAW_DATA_DIR / proyecto["archivo_csv"]
    if not ruta.exists():
        _falla(
            "No se encontró el archivo CSV esperado para el proyecto "
            f"'{proyecto['nombre']}'. Ubíquelo en data/raw/.",
            archivo=str(ruta),
        )

    df = pd.read_csv(
        ruta,
        sep=config.CSV_SEPARADOR,
        decimal=config.CSV_DECIMAL,
        encoding=config.CSV_ENCODING,
        dtype={config.COLUMNA_CODIGO_VEREDA: str},
    )

    columnas_faltantes = [c for c in config.COLUMNAS_ESPERADAS if c not in df.columns]
    if columnas_faltantes:
        _falla(
            "Faltan columnas obligatorias en el archivo.",
            archivo=proyecto["archivo_csv"],
            columna=", ".join(columnas_faltantes),
        )

    if "VER_CNMBR" in df.columns or "LONGITUD_EPM" in df.columns:
        _falla(
            "El archivo contiene columnas obsoletas no permitidas "
            "(VER_CNMBR o LONGITUD_EPM). Use VEREDA y "
            "LONGITUD_LINEAS_DISTRIBUCION.",
            archivo=proyecto["archivo_csv"],
        )

    df[config.COLUMNA_CODIGO_VEREDA] = df[config.COLUMNA_CODIGO_VEREDA].astype(str).str.strip()

    if df[config.COLUMNA_CODIGO_VEREDA].isna().any() or (df[config.COLUMNA_CODIGO_VEREDA] == "").any():
        _falla(
            "Existen registros con VER_CCDGO vacío o nulo.",
            archivo=proyecto["archivo_csv"],
        )

    duplicados = df[df[config.COLUMNA_CODIGO_VEREDA].duplicated(keep=False)]
    if not duplicados.empty:
        codigos = ", ".join(sorted(duplicados[config.COLUMNA_CODIGO_VEREDA].unique()))
        _falla(
            "Existen códigos VER_CCDGO duplicados dentro del mismo archivo.",
            archivo=proyecto["archivo_csv"],
            valor=codigos,
        )

    conteo_esperado = proyecto["veredas_esperadas"]
    if len(df) != conteo_esperado:
        print(
            f"Aviso: el archivo {proyecto['archivo_csv']} tiene {len(df)} "
            f"registros; se esperaban {conteo_esperado}. Se continúa el "
            "proceso, pero verifique la fuente de datos.",
            file=sys.stderr,
        )

    return df


def validar_unicidad_entre_proyectos(dataframes: dict[str, pd.DataFrame]) -> None:
    codigo_a_proyecto: dict[str, str] = {}
    for proyecto_id, df in dataframes.items():
        for codigo in df[config.COLUMNA_CODIGO_VEREDA]:
            if codigo in codigo_a_proyecto and codigo_a_proyecto[codigo] != proyecto_id:
                _falla(
                    "El código VER_CCDGO aparece repetido en más de un "
                    "proyecto. Cada vereda debe pertenecer a un único "
                    "proyecto.",
                    codigo=codigo,
                    valor=f"proyectos '{codigo_a_proyecto[codigo]}' y '{proyecto_id}'",
                )
            codigo_a_proyecto[codigo] = proyecto_id


# ---------------------------------------------------------------------------
# Validaciones de contenido (sección 11 del prompt)
# ---------------------------------------------------------------------------

def _es_vacio(valor) -> bool:
    if valor is None:
        return True
    if isinstance(valor, float) and np.isnan(valor):
        return True
    if isinstance(valor, str) and valor.strip() == "":
        return True
    return False


def validar_binarias(df: pd.DataFrame, proyecto: dict) -> None:
    for columna in config.COLUMNAS_BINARIAS:
        for idx, valor in df[columna].items():
            if _es_vacio(valor) or str(valor).strip() not in config.VALORES_BINARIOS_VALIDOS:
                ctx = _contexto_fila(df, idx)
                _falla(
                    f"Valor inválido en columna binaria '{columna}'. Se "
                    "esperaba exactamente 'SI' o 'NO'.",
                    archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
                    valor=valor, **ctx,
                )


def validar_nivel_seguridad(df: pd.DataFrame, proyecto: dict) -> None:
    columna = "NIVEL_SEGURIDAD"
    for idx, valor in df[columna].items():
        if _es_vacio(valor) or str(valor).strip() not in config.NIVELES_SEGURIDAD_VALIDOS:
            ctx = _contexto_fila(df, idx)
            _falla(
                "Valor inválido en NIVEL_SEGURIDAD. Valores permitidos: "
                + ", ".join(config.NIVELES_SEGURIDAD_VALIDOS),
                archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
                valor=valor, **ctx,
            )


def validar_vss_girasole(df: pd.DataFrame, proyecto: dict) -> pd.Series:
    columna = "VSS_GIRASOLE"
    valores = []
    for idx, valor in df[columna].items():
        ctx = _contexto_fila(df, idx)
        if _es_vacio(valor):
            _falla(
                "VSS_GIRASOLE no puede estar vacío ni ser nulo.",
                archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
                valor=valor, **ctx,
            )
        try:
            numero = float(valor)
        except (TypeError, ValueError):
            _falla(
                "VSS_GIRASOLE debe ser un número entero. Se encontró un "
                "valor no numérico.",
                archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
                valor=valor, **ctx,
            )
        if numero != int(numero):
            _falla(
                "VSS_GIRASOLE no admite valores decimales.",
                archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
                valor=valor, **ctx,
            )
        if numero < 0:
            _falla(
                "VSS_GIRASOLE no admite valores negativos.",
                archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
                valor=valor, **ctx,
            )
        valores.append(int(numero))
    return pd.Series(valores, index=df.index, dtype="Int64")


def _validar_columna_no_negativa_con_faltantes(
    df: pd.DataFrame, proyecto: dict, columna: str, *, limite_superior: float = None
) -> pd.Series:
    """
    Valida columnas donde -1 o vacío significan 'No disponible' y cualquier
    otro valor negativo detiene el proceso. Devuelve una Serie con float o
    None (pd.NA) para los valores no disponibles.
    """
    resultado = []
    for idx, valor in df[columna].items():
        ctx = _contexto_fila(df, idx)
        if _es_vacio(valor):
            resultado.append(np.nan)
            continue
        try:
            numero = float(valor)
        except (TypeError, ValueError):
            _falla(
                f"La columna '{columna}' contiene un valor no numérico.",
                archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
                valor=valor, **ctx,
            )
        if numero == -1:
            resultado.append(np.nan)
            continue
        if numero < 0:
            _falla(
                f"La columna '{columna}' contiene un valor negativo no "
                "permitido (solo se acepta -1 para 'No disponible').",
                archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
                valor=valor, **ctx,
            )
        if limite_superior is not None and numero > limite_superior:
            _falla(
                f"La columna '{columna}' supera el límite máximo permitido "
                f"({limite_superior}).",
                archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
                valor=valor, **ctx,
            )
        resultado.append(numero)
    return pd.Series(resultado, index=df.index, dtype="float64")


def validar_porcentajes(df: pd.DataFrame, proyecto: dict) -> dict[str, pd.Series]:
    columnas = [
        "BUFFER_DISTRIBUCION_PORCENTAJE",
        "BUFFER_DISTRIBUCION_PORCENTAJE_TECHOS_DENTRO",
        "BUFFER_DISTRIBUCION_PORCENTAJE_TECHOS_FUERA",
        "CULTIVOS_ILICITOS_PORCENTAJE",
    ]
    return {
        col: _validar_columna_no_negativa_con_faltantes(df, proyecto, col, limite_superior=100)
        for col in columnas
    }


def validar_longitudes_y_distancias(df: pd.DataFrame, proyecto: dict) -> dict[str, pd.Series]:
    columnas = [
        "LONGITUD_LINEAS_DISTRIBUCION",
        "DISTANCIA_PROMEDIO_VIVIENDAS_VIAS",
        "DISTANCIA_MINIMA_VIVIENDAS_VIAS",
        "DISTANCIA_MAXIMA_VIVIENDAS_VIAS",
    ]
    series = {
        col: _validar_columna_no_negativa_con_faltantes(df, proyecto, col)
        for col in columnas
    }

    minima = series["DISTANCIA_MINIMA_VIVIENDAS_VIAS"]
    promedio = series["DISTANCIA_PROMEDIO_VIVIENDAS_VIAS"]
    maxima = series["DISTANCIA_MAXIMA_VIVIENDAS_VIAS"]

    for idx in df.index:
        v_min, v_prom, v_max = minima[idx], promedio[idx], maxima[idx]
        if pd.isna(v_min) or pd.isna(v_prom) or pd.isna(v_max):
            continue
        if not (v_min <= v_prom <= v_max):
            ctx = _contexto_fila(df, idx)
            _falla(
                "Inconsistencia entre distancias: se esperaba "
                "DISTANCIA_MINIMA <= DISTANCIA_PROMEDIO <= DISTANCIA_MAXIMA.",
                archivo=proyecto["archivo_csv"], fila=idx,
                columna="DISTANCIA_*_VIVIENDAS_VIAS",
                valor=f"min={v_min}, prom={v_prom}, max={v_max}", **ctx,
            )

    return series


def validar_cultivos_ilicitos_ha(df: pd.DataFrame, proyecto: dict) -> pd.Series:
    return _validar_columna_no_negativa_con_faltantes(df, proyecto, "CULTIVOS_ILICITOS_HA")


# ---------------------------------------------------------------------------
# Columnas tipo diccionario (sección 10 del prompt)
# ---------------------------------------------------------------------------

def _parsear_valor_diccionario(valor, *, proyecto: dict, idx: int, columna: str, df: pd.DataFrame):
    ctx = _contexto_fila(df, idx)
    if _es_vacio(valor):
        _falla(
            f"La columna '{columna}' no admite valores vacíos o nulos. "
            "Use 0 para indicar ausencia de la categoría.",
            archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
            valor=valor, **ctx,
        )

    if isinstance(valor, (int, float)) and not isinstance(valor, bool):
        if float(valor) == -1:
            _falla(
                f"La columna '{columna}' no admite el valor -1.",
                archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
                valor=valor, **ctx,
            )
        if float(valor) == 0:
            return 0
        _falla(
            f"La columna '{columna}' contiene un número distinto de 0 que "
            "no corresponde a un diccionario válido.",
            archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
            valor=valor, **ctx,
        )

    texto = str(valor).strip()
    if texto == "-1":
        _falla(
            f"La columna '{columna}' no admite el valor -1.",
            archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
            valor=valor, **ctx,
        )
    if texto == "0":
        return 0

    try:
        resultado = ast.literal_eval(texto)
    except (ValueError, SyntaxError):
        _falla(
            f"No fue posible interpretar el contenido de '{columna}' como "
            "0 o como un diccionario Python.",
            archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
            valor=valor, **ctx,
        )

    if not isinstance(resultado, dict):
        _falla(
            f"El contenido de '{columna}' no es un diccionario válido.",
            archivo=proyecto["archivo_csv"], fila=idx, columna=columna,
            valor=valor, **ctx,
        )
    return resultado


def procesar_columnas_diccionario(df: pd.DataFrame, proyecto: dict) -> pd.DataFrame:
    runap_categorias_col = []
    runap_nombres_col = []
    consejos_col = []
    resguardos_col = []
    cantidad_consejos_col = []
    cantidad_resguardos_col = []
    runap_total_pct_col = []
    consejo_total_pct_col = []
    resguardo_total_pct_col = []

    for idx in df.index:
        runap_cat = _parsear_valor_diccionario(
            df.at[idx, "RUNAP_CATEGORIA"], proyecto=proyecto, idx=idx,
            columna="RUNAP_CATEGORIA", df=df,
        )
        runap_nom = _parsear_valor_diccionario(
            df.at[idx, "RUNAP_NOMBRE"], proyecto=proyecto, idx=idx,
            columna="RUNAP_NOMBRE", df=df,
        )
        consejo = _parsear_valor_diccionario(
            df.at[idx, "CONSEJO_COMUNITARIO"], proyecto=proyecto, idx=idx,
            columna="CONSEJO_COMUNITARIO", df=df,
        )
        resguardo = _parsear_valor_diccionario(
            df.at[idx, "RESGUARDO_INDIGENA"], proyecto=proyecto, idx=idx,
            columna="RESGUARDO_INDIGENA", df=df,
        )

        # RUNAP_CATEGORIA -> lista normalizada + total
        if runap_cat == 0:
            runap_categorias_col.append([])
            runap_total_pct_col.append(0.0)
        else:
            categorias = [
                {"nombre": k, "porcentaje": v}
                for k, v in runap_cat.items()
                if k not in config.CLAVES_RESUMEN_RUNAP_CATEGORIA
            ]
            runap_categorias_col.append(categorias)
            runap_total_pct_col.append(float(runap_cat.get("total_percentage", 0.0)))

        # RUNAP_NOMBRE -> lista normalizada (claves tupla -> objetos)
        if runap_nom == 0:
            runap_nombres_col.append([])
        else:
            nombres = []
            for clave, porcentaje in runap_nom.items():
                if isinstance(clave, tuple) and len(clave) == 2:
                    nombre_area, categoria_area = clave
                    nombres.append({
                        "nombre": nombre_area,
                        "categoria": categoria_area,
                        "porcentaje": porcentaje,
                    })
            runap_nombres_col.append(nombres)

        # CONSEJO_COMUNITARIO
        if consejo == 0:
            consejos_col.append([])
            cantidad_consejos_col.append(0)
            consejo_total_pct_col.append(0.0)
        else:
            lista = [
                {"nombre": k, "porcentaje": v}
                for k, v in consejo.items()
                if k not in config.CLAVES_RESUMEN_CONSEJO
            ]
            consejos_col.append(lista)
            cantidad_consejos_col.append(int(consejo.get("total_consejos", 0)))
            consejo_total_pct_col.append(float(consejo.get("total_percentage", 0.0)))

        # RESGUARDO_INDIGENA
        if resguardo == 0:
            resguardos_col.append([])
            cantidad_resguardos_col.append(0)
            resguardo_total_pct_col.append(0.0)
        else:
            lista = [
                {"nombre": k, "porcentaje": v}
                for k, v in resguardo.items()
                if k not in config.CLAVES_RESUMEN_RESGUARDO
            ]
            resguardos_col.append(lista)
            cantidad_resguardos_col.append(int(resguardo.get("total_resguardos", 0)))
            resguardo_total_pct_col.append(float(resguardo.get("total_percentage", 0.0)))

    df = df.copy()
    df["_runap_categorias"] = runap_categorias_col
    df["_runap_nombres"] = runap_nombres_col
    df["_consejos_comunitarios"] = consejos_col
    df["_resguardos_indigenas"] = resguardos_col
    df["_cantidad_consejos"] = cantidad_consejos_col
    df["_cantidad_resguardos"] = cantidad_resguardos_col
    df["_runap_total_porcentaje"] = runap_total_pct_col
    df["_consejo_total_porcentaje"] = consejo_total_pct_col
    df["_resguardo_total_porcentaje"] = resguardo_total_pct_col
    return df


# ---------------------------------------------------------------------------
# Procesamiento geoespacial (sección 12 del prompt)
# ---------------------------------------------------------------------------

def _extraer_componentes_poligonales(geom):
    if geom is None or geom.is_empty:
        return None
    if geom.geom_type in ("Polygon", "MultiPolygon"):
        return geom
    if geom.geom_type == "GeometryCollection":
        poligonos = [g for g in geom.geoms if g.geom_type in ("Polygon", "MultiPolygon")]
        if not poligonos:
            return None
        if len(poligonos) == 1:
            return poligonos[0]
        from shapely.ops import unary_union
        return unary_union(poligonos)
    return None


def procesar_geometrias(df: pd.DataFrame, proyecto: dict) -> tuple[gpd.GeoDataFrame, int]:
    geometrias_finales = []
    reparadas = 0

    for idx in df.index:
        ctx = _contexto_fila(df, idx)
        wkt_texto = df.at[idx, config.COLUMNA_GEOMETRIA]

        if _es_vacio(wkt_texto):
            _falla(
                "La geometría está vacía o nula.",
                archivo=proyecto["archivo_csv"], fila=idx, columna="geometry", **ctx,
            )

        try:
            geom = shapely_wkt.loads(str(wkt_texto))
        except Exception:
            _falla(
                "No fue posible interpretar la geometría WKT.",
                archivo=proyecto["archivo_csv"], fila=idx, columna="geometry", **ctx,
            )

        if geom is None or geom.is_empty:
            _falla(
                "La geometría interpretada está vacía.",
                archivo=proyecto["archivo_csv"], fila=idx, columna="geometry", **ctx,
            )

        if not geom.is_valid:
            geom = make_valid(geom)
            reparadas += 1
            if geom is None or geom.is_empty or not geom.is_valid:
                _falla(
                    "No fue posible reparar la geometría inválida.",
                    archivo=proyecto["archivo_csv"], fila=idx, columna="geometry", **ctx,
                )

        geom_poligonal = _extraer_componentes_poligonales(geom)
        if geom_poligonal is None or geom_poligonal.is_empty:
            _falla(
                "No fue posible obtener una geometría poligonal válida "
                "para esta vereda.",
                archivo=proyecto["archivo_csv"], fila=idx, columna="geometry", **ctx,
            )

        geometrias_finales.append(geom_poligonal)

    gdf = gpd.GeoDataFrame(df.copy(), geometry=geometrias_finales, crs=config.CRS_ORIGEN)

    # Simplificación en el CRS proyectado (unidades métricas), preservando topología
    gdf["geometry"] = gdf["geometry"].simplify(
        config.SIMPLIFY_TOLERANCE_METERS, preserve_topology=True
    )

    invalidas_post_simplificacion = ~gdf["geometry"].is_valid
    if invalidas_post_simplificacion.any():
        idx_invalida = gdf.index[invalidas_post_simplificacion][0]
        ctx = _contexto_fila(df, idx_invalida)
        _falla(
            "La geometría quedó inválida tras la simplificación.",
            archivo=proyecto["archivo_csv"], fila=idx_invalida, columna="geometry", **ctx,
        )

    gdf = gdf.to_crs(config.CRS_SALIDA)

    invalidas_post_transformacion = ~gdf["geometry"].is_valid
    if invalidas_post_transformacion.any():
        idx_invalida = gdf.index[invalidas_post_transformacion][0]
        ctx = _contexto_fila(df, idx_invalida)
        _falla(
            "La geometría quedó inválida tras transformar a EPSG:4326.",
            archivo=proyecto["archivo_csv"], fila=idx_invalida, columna="geometry", **ctx,
        )

    return gdf, reparadas


# ---------------------------------------------------------------------------
# Construcción de campos derivados y GeoJSON
# ---------------------------------------------------------------------------

def _valor_o_none(serie: pd.Series, idx):
    valor = serie[idx]
    if pd.isna(valor):
        return None
    return float(valor)


def _estado_presencia_binaria(valor) -> str | None:
    """Traduce 0/None/positivo a 'NO'/'NO_DISPONIBLE'/'SI' para campos de HA."""
    if valor is None:
        return None
    if valor > 0:
        return "SI"
    return "NO"


def construir_geojson(
    gdf: gpd.GeoDataFrame,
    proyecto: dict,
    vss_valido: pd.Series,
    porcentajes: dict[str, pd.Series],
    distancias: dict[str, pd.Series],
    cultivos_ha: pd.Series,
) -> dict:
    features = []

    for idx in gdf.index:
        fila = gdf.loc[idx]

        buffer_pct = _valor_o_none(porcentajes["BUFFER_DISTRIBUCION_PORCENTAJE"], idx)
        buffer_dentro = _valor_o_none(porcentajes["BUFFER_DISTRIBUCION_PORCENTAJE_TECHOS_DENTRO"], idx)
        buffer_fuera = _valor_o_none(porcentajes["BUFFER_DISTRIBUCION_PORCENTAJE_TECHOS_FUERA"], idx)
        cultivos_pct = _valor_o_none(porcentajes["CULTIVOS_ILICITOS_PORCENTAJE"], idx)

        longitud_lineas = _valor_o_none(distancias["LONGITUD_LINEAS_DISTRIBUCION"], idx)
        dist_prom = _valor_o_none(distancias["DISTANCIA_PROMEDIO_VIVIENDAS_VIAS"], idx)
        dist_min = _valor_o_none(distancias["DISTANCIA_MINIMA_VIVIENDAS_VIAS"], idx)
        dist_max = _valor_o_none(distancias["DISTANCIA_MAXIMA_VIVIENDAS_VIAS"], idx)

        cultivos_ha_valor = _valor_o_none(cultivos_ha, idx)

        propiedades = {
            "proyectoId": proyecto["id"],
            "VER_CCDGO": fila[config.COLUMNA_CODIGO_VEREDA],
            "DEPARTAMENTO": fila["DEPARTAMENTO"],
            "MUNICIPIO": fila["MUNICIPIO"],
            "VEREDA": fila["VEREDA"],
            "ISA_AID": fila["ISA_AID"],
            "LONGITUD_LINEAS_DISTRIBUCION": longitud_lineas,
            "BUFFER_DISTRIBUCION_PORCENTAJE": buffer_pct,
            "BUFFER_DISTRIBUCION_PORCENTAJE_TECHOS_DENTRO": buffer_dentro,
            "BUFFER_DISTRIBUCION_PORCENTAJE_TECHOS_FUERA": buffer_fuera,
            "PDET": fila["PDET"],
            "ZOMAC": fila["ZOMAC"],
            "VSS_GIRASOLE": int(vss_valido[idx]),
            "CULTIVOS_ILICITOS_HA": cultivos_ha_valor,
            "CULTIVOS_ILICITOS_PORCENTAJE": cultivos_pct,
            "CULTIVOS_ILICITOS_PRESENCIA": _estado_presencia_binaria(cultivos_ha_valor),
            "NIVEL_SEGURIDAD": fila["NIVEL_SEGURIDAD"],
            "DISTANCIA_PROMEDIO_VIVIENDAS_VIAS": dist_prom,
            "DISTANCIA_MINIMA_VIVIENDAS_VIAS": dist_min,
            "DISTANCIA_MAXIMA_VIVIENDAS_VIAS": dist_max,
            "DISTRIBUCION_ENERGIA_PRESENCIA": _estado_presencia_binaria(buffer_pct),
            "runapCategorias": fila["_runap_categorias"],
            "runapNombres": fila["_runap_nombres"],
            "consejosComunitarios": fila["_consejos_comunitarios"],
            "resguardosIndigenas": fila["_resguardos_indigenas"],
            "CANTIDAD_CONSEJOS": int(fila["_cantidad_consejos"]),
            "CANTIDAD_RESGUARDOS": int(fila["_cantidad_resguardos"]),
            "RUNAP_TOTAL_PORCENTAJE": float(fila["_runap_total_porcentaje"]),
            "CONSEJO_TOTAL_PORCENTAJE": float(fila["_consejo_total_porcentaje"]),
            "RESGUARDO_TOTAL_PORCENTAJE": float(fila["_resguardo_total_porcentaje"]),
            "AREA_PROTEGIDA_PRESENCIA": bool(len(fila["_runap_categorias"]) > 0),
            "CONSEJO_COMUNITARIO_PRESENCIA": bool(len(fila["_consejos_comunitarios"]) > 0),
            "RESGUARDO_INDIGENA_PRESENCIA": bool(len(fila["_resguardos_indigenas"]) > 0),
        }

        features.append({
            "type": "Feature",
            "geometry": json.loads(gpd.GeoSeries([fila.geometry]).to_json())["features"][0]["geometry"],
            "properties": propiedades,
        })

    return {"type": "FeatureCollection", "features": features}


def _escribir_json_atomico(ruta: Path, datos: dict, *, minificar: bool = False) -> None:
    ruta.parent.mkdir(parents=True, exist_ok=True)
    fd, temp_path = tempfile.mkstemp(dir=str(ruta.parent), suffix=".tmp")
    try:
        with open(fd, "w", encoding="utf-8") as f:
            if minificar:
                json.dump(datos, f, ensure_ascii=False, separators=(",", ":"))
            else:
                json.dump(datos, f, ensure_ascii=False, indent=2)
        Path(temp_path).replace(ruta)
    except Exception:
        Path(temp_path).unlink(missing_ok=True)
        raise


# ---------------------------------------------------------------------------
# Orquestación principal
# ---------------------------------------------------------------------------

def procesar_proyecto(proyecto: dict, df: pd.DataFrame) -> tuple[dict, int]:
    validar_binarias(df, proyecto)
    validar_nivel_seguridad(df, proyecto)
    vss_valido = validar_vss_girasole(df, proyecto)
    porcentajes = validar_porcentajes(df, proyecto)
    distancias = validar_longitudes_y_distancias(df, proyecto)
    cultivos_ha = validar_cultivos_ilicitos_ha(df, proyecto)

    df = procesar_columnas_diccionario(df, proyecto)

    gdf, reparadas = procesar_geometrias(df, proyecto)

    geojson = construir_geojson(
        gdf, proyecto, vss_valido, porcentajes, distancias, cultivos_ha
    )

    return geojson, reparadas


def main() -> int:
    print("Iniciando preprocesamiento de datos de Girasole...\n")

    try:
        dataframes: dict[str, pd.DataFrame] = {}
        for proyecto in config.PROYECTOS:
            dataframes[proyecto["id"]] = leer_csv(proyecto)

        validar_unicidad_entre_proyectos(dataframes)

        resumen_proyectos = []
        total_veredas = 0

        for proyecto in config.PROYECTOS:
            df = dataframes[proyecto["id"]]
            geojson, reparadas = procesar_proyecto(proyecto, df)

            ruta_salida = config.OUTPUT_DATA_DIR / proyecto["archivo_salida"]
            _escribir_json_atomico(ruta_salida, geojson, minificar=True)

            n_veredas = len(geojson["features"])
            total_veredas += n_veredas

            resumen_proyectos.append({
                "id": proyecto["id"],
                "nombre": proyecto["nombre"],
                "archivo": proyecto["archivo_salida"],
                "veredas": n_veredas,
                "reparadas": reparadas,
            })

        manifest = {
            "generadoEn": datetime.now(timezone.utc).isoformat(),
            "crsOrigen": config.CRS_ORIGEN,
            "crsSalida": config.CRS_SALIDA,
            "toleranciaSimplificacionMetros": config.SIMPLIFY_TOLERANCE_METERS,
            "versionEsquema": config.VERSION_ESQUEMA,
            "totalVeredas": total_veredas,
            "proyectos": [
                {
                    "id": r["id"],
                    "nombre": r["nombre"],
                    "archivo": r["archivo"],
                    "veredas": r["veredas"],
                }
                for r in resumen_proyectos
            ],
        }
        _escribir_json_atomico(config.OUTPUT_DATA_DIR / "manifest.json", manifest)

    except ValidationError as error:
        print("\nError de validación. El preprocesamiento se detuvo.\n", file=sys.stderr)
        print(str(error), file=sys.stderr)
        return 1
    except Exception as error:  # noqa: BLE001
        print(f"\nError inesperado durante el preprocesamiento: {error}", file=sys.stderr)
        return 1

    print("Preprocesamiento completado correctamente.\n")
    for r in resumen_proyectos:
        print(f"Proyecto: {r['nombre']}")
        print(f"Veredas procesadas: {r['veredas']}")
        print(f"Geometrías reparadas: {r['reparadas']}")
        print(f"Archivo generado: public/data/{r['archivo']}\n")

    print(f"Total de veredas procesadas: {total_veredas}")
    print(f"CRS de salida: {config.CRS_SALIDA}")
    print(f"Tolerancia de simplificación: {config.SIMPLIFY_TOLERANCE_METERS} metros")

    return 0


if __name__ == "__main__":
    sys.exit(main())
