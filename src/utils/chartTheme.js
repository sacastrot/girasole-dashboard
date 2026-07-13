/**
 * Tokens de color para adaptar cualquier opción de ECharts al tema activo.
 * Se aplican de forma genérica sobre la opción construida por cada gráfico,
 * evitando duplicar lógica de tematización en cada componente.
 */
function tokensTema(modoOscuro) {
  return modoOscuro
    ? {
        textColor: '#D7DEE8',
        textColorSuave: '#9AA6B5',
        axisLineColor: '#3A4657',
        splitLineColor: '#28323F',
        tooltipBg: '#101722',
        tooltipBorder: '#2E3A4A',
      }
    : {
        textColor: '#333B47',
        textColorSuave: '#5B6675',
        axisLineColor: '#DDE3EA',
        splitLineColor: '#EEF1F5',
        tooltipBg: '#FFFFFF',
        tooltipBorder: '#DDE3EA',
      }
}

function aplicarEjeUnico(eje, tema) {
  if (!eje) return eje
  return {
    ...eje,
    axisLabel: { ...(eje.axisLabel || {}), color: tema.textColorSuave },
    axisLine: {
      ...(eje.axisLine || {}),
      lineStyle: { ...((eje.axisLine || {}).lineStyle || {}), color: tema.axisLineColor },
    },
    splitLine: {
      ...(eje.splitLine || {}),
      lineStyle: { ...((eje.splitLine || {}).lineStyle || {}), color: tema.splitLineColor },
    },
    nameTextStyle: { ...(eje.nameTextStyle || {}), color: tema.textColorSuave },
  }
}

function aplicarEje(ejeOEjes, tema) {
  if (!ejeOEjes) return ejeOEjes
  if (Array.isArray(ejeOEjes)) return ejeOEjes.map((e) => aplicarEjeUnico(e, tema))
  return aplicarEjeUnico(ejeOEjes, tema)
}

/**
 * Recibe una opción "lógica" de ECharts (series, ejes, tooltip, leyenda) y le
 * superpone los colores correspondientes al tema activo.
 */
export function aplicarTemaEcharts(opcion, modoOscuro) {
  const tema = tokensTema(modoOscuro)
  const resultado = JSON.parse(JSON.stringify(opcion))

  if (resultado.title) {
    resultado.title.textStyle = { ...(resultado.title.textStyle || {}), color: tema.textColor }
    resultado.title.subtextStyle = {
      ...(resultado.title.subtextStyle || {}),
      color: tema.textColorSuave,
    }
  }

  if (resultado.legend) {
    resultado.legend.textStyle = { ...(resultado.legend.textStyle || {}), color: tema.textColorSuave }
  }

  if (resultado.tooltip) {
    resultado.tooltip = {
      ...resultado.tooltip,
      backgroundColor: tema.tooltipBg,
      borderColor: tema.tooltipBorder,
      textStyle: { color: tema.textColor },
    }
  }

  if (resultado.xAxis) resultado.xAxis = aplicarEje(resultado.xAxis, tema)
  if (resultado.yAxis) resultado.yAxis = aplicarEje(resultado.yAxis, tema)

  return resultado
}
