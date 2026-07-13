import { normalizarDirecto, normalizarInvertido, limitarRango } from './normalization'

/**
 * Calcula el puntaje de priorización para todas las veredas elegibles de un
 * proyecto (VSS_GIRASOLE > umbral), usando como universo de normalización
 * TODAS las veredas elegibles del proyecto, sin aplicar los filtros globales.
 *
 * @param {Array} features - Features GeoJSON crudas del proyecto completo.
 * @param {number} umbral - Umbral mínimo vigente de viviendas sin energía.
 * @returns {Map<string, object>} Mapa VER_CCDGO -> resultado del puntaje.
 */
export function calcularPuntajes(features, umbral) {
  const resultado = new Map()

  const elegibles = features.filter((f) => f.properties.VSS_GIRASOLE > umbral)
  if (elegibles.length === 0) return resultado

  // Componente 1: viviendas sin energía (VSS_GIRASOLE)
  const valoresVss = elegibles.map((f) => f.properties.VSS_GIRASOLE)
  const minVss = Math.min(...valoresVss)
  const maxVss = Math.max(...valoresVss)

  // Componente 2: comunidades étnicas (consejos + resguardos)
  const valoresEtnico = elegibles.map(
    (f) => f.properties.CANTIDAD_CONSEJOS + f.properties.CANTIDAD_RESGUARDOS
  )
  const minEtnico = Math.min(...valoresEtnico)
  const maxEtnico = Math.max(...valoresEtnico)

  // Componente 3: accesibilidad vial (distancia promedio), solo con datos válidos
  const distanciasValidas = elegibles
    .map((f) => f.properties.DISTANCIA_PROMEDIO_VIVIENDAS_VIAS)
    .filter((v) => v !== null && v !== undefined)
  const minDist = distanciasValidas.length ? Math.min(...distanciasValidas) : null
  const maxDist = distanciasValidas.length ? Math.max(...distanciasValidas) : null

  elegibles.forEach((f, i) => {
    const p = f.properties
    const componenteVss = normalizarDirecto(valoresVss[i], minVss, maxVss)
    const componenteEtnico = normalizarDirecto(valoresEtnico[i], minEtnico, maxEtnico)

    const distancia = p.DISTANCIA_PROMEDIO_VIVIENDAS_VIAS
    const tieneDistancia = distancia !== null && distancia !== undefined
    const componenteDistancia = tieneDistancia
      ? normalizarInvertido(distancia, minDist, maxDist)
      : 0

    const puntajeCrudo = (componenteVss + componenteEtnico + componenteDistancia) / 3
    const puntaje = limitarRango(puntajeCrudo)

    let calificacion
    if (puntaje >= 80) calificacion = 'Alta'
    else if (puntaje >= 50) calificacion = 'Media'
    else calificacion = 'Baja'

    resultado.set(p.VER_CCDGO, {
      puntaje,
      calificacion,
      componentes: {
        vss: componenteVss,
        etnico: componenteEtnico,
        distancia: componenteDistancia,
      },
    })
  })

  return resultado
}
