# -*- coding: utf-8 -*-
"""
Configuración centralizada del preprocesamiento de datos de Girasole.

Este archivo concentra todos los parámetros que un desarrollador podría
necesitar ajustar sin tener que modificar la lógica del script principal
(`preprocess_data.py`).
"""

from pathlib import Path

# ---------------------------------------------------------------------------
# Rutas
# ---------------------------------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent
RAW_DATA_DIR = BASE_DIR / "data" / "raw"
OUTPUT_DATA_DIR = BASE_DIR / "public" / "data"

# ---------------------------------------------------------------------------
# Proyectos
# ---------------------------------------------------------------------------
# Cada proyecto define:
#   id            -> identificador técnico usado en manifest.json y GeoJSON
#   nombre        -> nombre visible en la interfaz
#   archivo_csv   -> nombre exacto del archivo esperado en data/raw/
#   archivo_salida-> nombre del GeoJSON generado en public/data/
#   veredas_esperadas -> número de registros esperado (validación informativa)

PROYECTOS = [
    {
        "id": "nordeste",
        "nombre": "Interconexión Nordeste",
        "archivo_csv": "130726_REPORT_VEREDAS_INFLUENCIA_ENERGY_NEW_LT_NORDESTE_WITH_GEOMETRY.csv",
        "archivo_salida": "nordeste.geojson",
        "veredas_esperadas": 345,
    },
    {
        "id": "aguaclara",
        "nombre": "Subestación Aguaclara",
        "archivo_csv": "130726_REPORT_VEREDAS_INFLUENCIA_ENERGY_NEW_LT_AGUACLARA_WITH_GEOMETRY.csv",
        "archivo_salida": "aguaclara.geojson",
        "veredas_esperadas": 111,
    },
    {
        "id": "oriental",
        "nombre": "Interconexión Antioquia Oriental",
        "archivo_csv": "130726_REPORT_VEREDAS_INFLUENCIA_ENERGY_NEW_LT_ORIENTAL_WITH_GEOMETRY.csv",
        "archivo_salida": "oriental.geojson",
        "veredas_esperadas": 430,
    },
    {
        "id": "amanecer",
        "nombre": "Subestación Amanecer",
        "archivo_csv": "130726_REPORT_VEREDAS_INFLUENCIA_ENERGY_NEW_LT_AMANECER_WITH_GEOMETRY.csv",
        "archivo_salida": "amanecer.geojson",
        "veredas_esperadas": 182,
    },
]

TOTAL_VEREDAS_ESPERADAS = 1070

# ---------------------------------------------------------------------------
# Lectura de CSV
# ---------------------------------------------------------------------------

CSV_SEPARADOR = ";"
CSV_DECIMAL = "."
CSV_ENCODING = "utf-8-sig"

COLUMNA_GEOMETRIA = "geometry"
COLUMNA_CODIGO_VEREDA = "VER_CCDGO"

COLUMNAS_ESPERADAS = [
    "VER_CCDGO",
    "DEPARTAMENTO",
    "MUNICIPIO",
    "VEREDA",
    "ISA_AID",
    "LONGITUD_LINEAS_DISTRIBUCION",
    "BUFFER_DISTRIBUCION_PORCENTAJE",
    "BUFFER_DISTRIBUCION_PORCENTAJE_TECHOS_DENTRO",
    "BUFFER_DISTRIBUCION_PORCENTAJE_TECHOS_FUERA",
    "PDET",
    "ZOMAC",
    "VSS_GIRASOLE",
    "CULTIVOS_ILICITOS_HA",
    "CULTIVOS_ILICITOS_PORCENTAJE",
    "RUNAP_CATEGORIA",
    "RUNAP_NOMBRE",
    "CONSEJO_COMUNITARIO",
    "RESGUARDO_INDIGENA",
    "NIVEL_SEGURIDAD",
    "DISTANCIA_PROMEDIO_VIVIENDAS_VIAS",
    "DISTANCIA_MINIMA_VIVIENDAS_VIAS",
    "DISTANCIA_MAXIMA_VIVIENDAS_VIAS",
    "geometry",
]

# Columnas que contienen 0 o una representación textual de diccionario Python
COLUMNAS_DICCIONARIO = [
    "RUNAP_CATEGORIA",
    "RUNAP_NOMBRE",
    "CONSEJO_COMUNITARIO",
    "RESGUARDO_INDIGENA",
]

# Claves de resumen que no deben tratarse como categorías/nombres reales
CLAVES_RESUMEN_RUNAP_CATEGORIA = {"total_percentage", "count"}
CLAVES_RESUMEN_CONSEJO = {"total_percentage", "total_consejos"}
CLAVES_RESUMEN_RESGUARDO = {"total_percentage", "total_resguardos"}

# ---------------------------------------------------------------------------
# Validación de variables binarias y categóricas
# ---------------------------------------------------------------------------

VALORES_BINARIOS_VALIDOS = {"SI", "NO"}
COLUMNAS_BINARIAS = ["PDET", "ZOMAC", "ISA_AID"]

NIVELES_SEGURIDAD_VALIDOS = ["MUY BAJO", "BAJO", "MEDIO", "ALTO"]

# ---------------------------------------------------------------------------
# Procesamiento geoespacial
# ---------------------------------------------------------------------------

CRS_ORIGEN = "EPSG:9377"
CRS_SALIDA = "EPSG:4326"

# Tolerancia de simplificación de geometría, en metros, aplicada en CRS_ORIGEN
# (una unidad proyectada métrica). Ajustar aquí si se requiere más o menos
# detalle en los polígonos finales.
SIMPLIFY_TOLERANCE_METERS = 20

# ---------------------------------------------------------------------------
# Versionado del esquema de datos
# ---------------------------------------------------------------------------

VERSION_ESQUEMA = "1.0.0"
