/**
 * Funciones puras de agregación sobre arreglos de features GeoJSON. No
 * dependen de Vue ni de componentes; reciben datos y devuelven estructuras
 * simples listas para alimentar tarjetas y gráficos.
 */

function valoresValidos(features, campo) {
  return features
    .map((f) => f.properties[campo])
    .filter((v) => v !== null && v !== undefined)
}

export function calcularMetricasResumen(features) {
  const totalVeredas = features.length
  const totalMunicipios = new Set(features.map((f) => f.properties.MUNICIPIO)).size
  const totalDepartamentos = new Set(features.map((f) => f.properties.DEPARTAMENTO)).size

  const viviendasSinEnergia = features.reduce((acc, f) => acc + f.properties.VSS_GIRASOLE, 0)

  const hectareasValidas = valoresValidos(features, 'CULTIVOS_ILICITOS_HA')
  const hectareasCultivosIlicitos = hectareasValidas.reduce((a, b) => a + b, 0)

  const veredasAreasProtegidas = features.filter((f) => f.properties.AREA_PROTEGIDA_PRESENCIA).length
  const veredasConsejos = features.filter((f) => f.properties.CONSEJO_COMUNITARIO_PRESENCIA).length
  const veredasResguardos = features.filter((f) => f.properties.RESGUARDO_INDIGENA_PRESENCIA).length

  const veredasConDistribucion = features.filter(
    (f) => f.properties.DISTRIBUCION_ENERGIA_PRESENCIA === 'SI'
  ).length
  const veredasSinDistribucion = features.filter(
    (f) => f.properties.DISTRIBUCION_ENERGIA_PRESENCIA === 'NO'
  ).length
  const veredasDistribucionNoDisponible = features.filter(
    (f) => f.properties.DISTRIBUCION_ENERGIA_PRESENCIA === null
  ).length

  const distanciasValidas = valoresValidos(features, 'DISTANCIA_PROMEDIO_VIVIENDAS_VIAS')
  const distanciaPromedio = distanciasValidas.length
    ? distanciasValidas.reduce((a, b) => a + b, 0) / distanciasValidas.length
    : null

  return {
    totalVeredas,
    totalMunicipios,
    totalDepartamentos,
    viviendasSinEnergia,
    hectareasCultivosIlicitos,
    veredasAreasProtegidas,
    veredasConsejos,
    veredasResguardos,
    veredasConDistribucion,
    veredasSinDistribucion,
    veredasDistribucionNoDisponible,
    distanciaPromedio,
  }
}

/** Agrupa y suma/cuenta un campo numérico por una categoría textual. */
export function agruparYSumar(features, campoCategoria, campoValor) {
  const mapa = new Map()
  features.forEach((f) => {
    const categoria = f.properties[campoCategoria]
    const valor = f.properties[campoValor]
    if (valor === null || valor === undefined) return
    mapa.set(categoria, (mapa.get(categoria) || 0) + valor)
  })
  const entradas = [...mapa.entries()].sort((a, b) => b[1] - a[1])
  return { categorias: entradas.map((e) => e[0]), valores: entradas.map((e) => e[1]) }
}

/** Cuenta veredas por categoría textual (por ejemplo, veredas por municipio). */
export function agruparYContar(features, campoCategoria) {
  const mapa = new Map()
  features.forEach((f) => {
    const categoria = f.properties[campoCategoria]
    mapa.set(categoria, (mapa.get(categoria) || 0) + 1)
  })
  const entradas = [...mapa.entries()].sort((a, b) => b[1] - a[1])
  return { categorias: entradas.map((e) => e[0]), valores: entradas.map((e) => e[1]) }
}

/** Promedio de un campo numérico por categoría, excluyendo valores faltantes. */
export function agruparYPromediar(features, campoCategoria, campoValor) {
  const sumas = new Map()
  const conteos = new Map()
  features.forEach((f) => {
    const categoria = f.properties[campoCategoria]
    const valor = f.properties[campoValor]
    if (valor === null || valor === undefined) return
    sumas.set(categoria, (sumas.get(categoria) || 0) + valor)
    conteos.set(categoria, (conteos.get(categoria) || 0) + 1)
  })
  const categorias = [...sumas.keys()]
  const valores = categorias.map((c) => sumas.get(c) / conteos.get(c))
  const combinado = categorias
    .map((c, i) => [c, valores[i]])
    .sort((a, b) => b[1] - a[1])
  return { categorias: combinado.map((e) => e[0]), valores: combinado.map((e) => e[1]) }
}

const ETIQUETAS_TRIESTADO = { SI: 'Sí', NO: 'No', NO_DISPONIBLE: 'No disponible' }
export const COLORES_TRIESTADO = ['#1959B8', '#94A0AF', '#DDE3EA']

/** Distribución Sí / No / No disponible de un campo de presencia tri-estado. */
export function contarTriEstado(features, campoPresencia) {
  let si = 0
  let no = 0
  let noDisponible = 0
  features.forEach((f) => {
    const v = f.properties[campoPresencia]
    if (v === 'SI') si++
    else if (v === 'NO') no++
    else noDisponible++
  })
  return {
    categorias: [ETIQUETAS_TRIESTADO.SI, ETIQUETAS_TRIESTADO.NO, ETIQUETAS_TRIESTADO.NO_DISPONIBLE],
    valores: [si, no, noDisponible],
  }
}

export const COLORES_BOOLEANO = ['#1959B8', '#DDE3EA']

/** Distribución Sí / No de una variable binaria textual (PDET, ZOMAC, ISA_AID). */
export function contarSiNo(features, campo) {
  let si = 0
  let no = 0
  features.forEach((f) => {
    if (f.properties[campo] === 'SI') si++
    else no++
  })
  return { categorias: ['Sí', 'No'], valores: [si, no] }
}

/** Distribución Sí / No de un campo de presencia booleana. */
export function contarBooleano(features, campoPresencia) {
  let si = 0
  let no = 0
  features.forEach((f) => {
    if (f.properties[campoPresencia]) si++
    else no++
  })
  return { categorias: ['Sí', 'No'], valores: [si, no] }
}

/**
 * Cuenta veredas por categoría de zona protegida (RUNAP). Una vereda puede
 * aportar a varias categorías; se cuenta una vez por cada categoría presente.
 */
export function contarCategoriasRunap(features) {
  const mapa = new Map()
  features.forEach((f) => {
    f.properties.runapCategorias.forEach((c) => {
      mapa.set(c.nombre, (mapa.get(c.nombre) || 0) + 1)
    })
  })
  const entradas = [...mapa.entries()].sort((a, b) => b[1] - a[1])
  return { categorias: entradas.map((e) => e[0]), valores: entradas.map((e) => e[1]) }
}

const ORDEN_SEGURIDAD = ['MUY BAJO', 'BAJO', 'MEDIO', 'ALTO']
export const COLORES_SEGURIDAD = {
  'MUY BAJO': '#1E9E5A',
  BAJO: '#7CB518',
  MEDIO: '#F2A900',
  ALTO: '#D64545',
}

/** Distribución de veredas por nivel de seguridad, en orden lógico fijo. */
export function contarPorNivelSeguridad(features) {
  const conteos = Object.fromEntries(ORDEN_SEGURIDAD.map((n) => [n, 0]))
  features.forEach((f) => {
    conteos[f.properties.NIVEL_SEGURIDAD] = (conteos[f.properties.NIVEL_SEGURIDAD] || 0) + 1
  })
  const presentes = ORDEN_SEGURIDAD.filter((n) => conteos[n] > 0)
  return {
    categorias: presentes,
    valores: presentes.map((n) => conteos[n]),
    colores: presentes.map((n) => COLORES_SEGURIDAD[n]),
  }
}

/**
 * Distribución tri-estado de un campo por municipio (por ejemplo, cultivos
 * ilícitos por municipio). Devuelve series aptas para barras apiladas.
 */
export function contarTriEstadoPorMunicipio(features, campoPresencia) {
  const municipios = [...new Set(features.map((f) => f.properties.MUNICIPIO))]
  const conteos = { SI: [], NO: [], NO_DISPONIBLE: [] }

  municipios.forEach((municipio) => {
    const deMunicipio = features.filter((f) => f.properties.MUNICIPIO === municipio)
    conteos.SI.push(deMunicipio.filter((f) => f.properties[campoPresencia] === 'SI').length)
    conteos.NO.push(deMunicipio.filter((f) => f.properties[campoPresencia] === 'NO').length)
    conteos.NO_DISPONIBLE.push(
      deMunicipio.filter((f) => f.properties[campoPresencia] === null).length
    )
  })

  return {
    categorias: municipios,
    series: [
      { nombre: 'Sí', data: conteos.SI, color: COLORES_TRIESTADO[0] },
      { nombre: 'No', data: conteos.NO, color: COLORES_TRIESTADO[1] },
      { nombre: 'No disponible', data: conteos.NO_DISPONIBLE, color: COLORES_TRIESTADO[2] },
    ],
  }
}

/** Top N veredas por puntaje de priorización, de mayor a menor. */
export function topVeredasPorPuntaje(features, puntajesPorVereda, n = 10) {
  const conPuntaje = features
    .map((f) => ({
      nombre: f.properties.VEREDA,
      municipio: f.properties.MUNICIPIO,
      puntaje: puntajesPorVereda.get(f.properties.VER_CCDGO)?.puntaje ?? 0,
    }))
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, n)

  return {
    categorias: conPuntaje.map((v) => `${v.nombre} (${v.municipio})`),
    valores: conPuntaje.map((v) => Number(v.puntaje.toFixed(1))),
  }
}

/** Distribución de veredas elegibles por calificación de prioridad. */
export function contarPorCalificacion(features, puntajesPorVereda) {
  let alta = 0
  let media = 0
  let baja = 0
  features.forEach((f) => {
    const resultado = puntajesPorVereda.get(f.properties.VER_CCDGO)
    if (!resultado) return
    if (resultado.calificacion === 'Alta') alta++
    else if (resultado.calificacion === 'Media') media++
    else baja++
  })
  return {
    categorias: ['Alta', 'Media', 'Baja'],
    valores: [alta, media, baja],
    colores: ['#C1440E', '#F7941D', '#94A0AF'],
  }
}
