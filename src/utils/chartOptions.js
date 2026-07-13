/**
 * Constructores de opciones "lógicas" de ECharts. No incluyen colores de
 * tema (eso lo aplica utils/chartTheme.js de forma centralizada), pero sí
 * definen tipo de gráfico, ejes, tooltip, leyenda y colores de datos.
 */

const FUENTE_BASE = { fontFamily: 'Inter, system-ui, sans-serif' }

function tooltipCategoriaValor(unidad) {
  return {
    trigger: 'item',
    appendToBody: true,
    ...FUENTE_BASE,
    formatter: (parametros) => {
      const p = Array.isArray(parametros) ? parametros[0] : parametros
      const valor = typeof p.value === 'number' ? p.value.toLocaleString('es-CO') : p.value
      return `${p.name}<br/>${p.marker || ''}${valor} ${unidad}`.trim()
    },
  }
}

function tooltipEje(unidad) {
  return {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    appendToBody: true,
    ...FUENTE_BASE,
    formatter: (parametros) => {
      const lista = Array.isArray(parametros) ? parametros : [parametros]
      const encabezado = lista[0]?.axisValueLabel ?? lista[0]?.name ?? ''
      const filas = lista
        .map((p) => {
          const valor = typeof p.value === 'number' ? p.value.toLocaleString('es-CO') : p.value
          return `${p.marker} ${p.seriesName}: ${valor} ${unidad}`
        })
        .join('<br/>')
      return `${encabezado}<br/>${filas}`
    },
  }
}

/**
 * Gráfico de barras horizontales para una sola serie. Ideal para rankings o
 * categorías con nombres largos (municipios, veredas, categorías RUNAP).
 */
export function construirBarraHorizontal(categorias, valores, opciones = {}) {
  const { unidad = '', nombreSerie = '', color = '#1959B8', nombreGrafico = '' } = opciones
  const necesitaScroll = categorias.length > 8

  return {
    title: nombreGrafico ? { text: nombreGrafico, left: 0, textStyle: { fontSize: 13 } } : undefined,
    grid: { left: '2%', right: 16, top: nombreGrafico ? 36 : 12, bottom: 8, containLabel: true },
    tooltip: tooltipEje(unidad),
    xAxis: { type: 'value', axisLabel: {} },
    yAxis: { type: 'category', data: categorias, axisLabel: { overflow: 'truncate', width: 130 } },
    dataZoom: necesitaScroll
      ? [{ type: 'inside', yAxisIndex: 0, start: 0, end: (8 / categorias.length) * 100 }]
      : undefined,
    series: [
      {
        name: nombreSerie,
        type: 'bar',
        data: valores,
        itemStyle: { color, borderRadius: [0, 4, 4, 0] },
        barMaxWidth: 22,
      },
    ],
  }
}

/**
 * Barras horizontales apiladas para varias series categóricas (por ejemplo,
 * presencia de cultivos ilícitos: Sí / No / No disponible, por municipio).
 */
export function construirBarrasApiladasHorizontal(categorias, series, opciones = {}) {
  const { unidad = '' } = opciones
  const necesitaScroll = categorias.length > 8

  return {
    grid: { left: '2%', right: 16, top: 36, bottom: 8, containLabel: true },
    tooltip: tooltipEje(unidad),
    legend: { top: 0 },
    xAxis: { type: 'value' },
    yAxis: { type: 'category', data: categorias, axisLabel: { overflow: 'truncate', width: 130 } },
    dataZoom: necesitaScroll
      ? [{ type: 'inside', yAxisIndex: 0, start: 0, end: (8 / categorias.length) * 100 }]
      : undefined,
    series: series.map((s) => ({
      name: s.nombre,
      type: 'bar',
      stack: 'total',
      data: s.data,
      itemStyle: { color: s.color },
      barMaxWidth: 22,
    })),
  }
}

/** Barras verticales agrupadas, para pocas categorías (2 a 4). */
export function construirBarrasAgrupadasVertical(categorias, series, opciones = {}) {
  const { unidad = '' } = opciones
  return {
    grid: { left: '2%', right: '2%', top: 36, bottom: 8, containLabel: true },
    tooltip: tooltipEje(unidad),
    legend: { top: 0 },
    xAxis: { type: 'category', data: categorias },
    yAxis: { type: 'value', name: unidad },
    series: series.map((s) => ({
      name: s.nombre,
      type: 'bar',
      data: s.data,
      itemStyle: { color: s.color },
      barMaxWidth: 40,
    })),
  }
}

/** Barras verticales de una sola serie con color por categoría (nivel de seguridad). */
export function construirBarraVerticalColoreada(categorias, valores, colores, opciones = {}) {
  const { unidad = '' } = opciones
  return {
    grid: { left: '2%', right: '2%', top: 12, bottom: 8, containLabel: true },
    tooltip: tooltipEje(unidad),
    xAxis: { type: 'category', data: categorias },
    yAxis: { type: 'value', name: unidad },
    series: [
      {
        type: 'bar',
        data: valores.map((v, i) => ({ value: v, itemStyle: { color: colores[i] } })),
        barMaxWidth: 48,
      },
    ],
  }
}

/**
 * Gráfico de dona para categorías con pocos valores (2 a 4), como presencia
 * de distribución de energía o clasificación de prioridad.
 */
export function construirDona(categorias, valores, colores, opciones = {}) {
  const { unidad = 'veredas' } = opciones
  const datos = categorias.map((nombre, i) => ({
    name: nombre,
    value: valores[i],
    itemStyle: { color: colores[i] },
  }))

  return {
    tooltip: tooltipCategoriaValor(unidad),
    legend: { bottom: 0, textStyle: {} },
    series: [
      {
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        label: { formatter: '{b}\n{d}%', fontSize: 11 },
        data: datos,
      },
    ],
  }
}
