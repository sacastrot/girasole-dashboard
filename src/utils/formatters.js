/**
 * Utilidades de formato numérico para el dashboard.
 * Todas las funciones usan Intl.NumberFormat con configuración es-CO.
 */

const LOCALE = 'es-CO'

const NO_DISPONIBLE = 'No disponible'

const enteroFormatter = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 })
const decimal1Formatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const decimal2Formatter = new Intl.NumberFormat(LOCALE, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function esFaltante(valor) {
  return valor === null || valor === undefined || Number.isNaN(valor)
}

/** Formatea un entero (veredas, viviendas, cantidades). Sin decimales. */
export function formatEntero(valor) {
  if (esFaltante(valor)) return NO_DISPONIBLE
  return enteroFormatter.format(valor)
}

/** Formatea una distancia en metros, con separador de miles. */
export function formatDistanciaMetros(valor) {
  if (esFaltante(valor)) return NO_DISPONIBLE
  return `${enteroFormatter.format(valor)} m`
}

/** Formatea un porcentaje con un decimal. El valor ya viene en escala 0-100. */
export function formatPorcentaje(valor) {
  if (esFaltante(valor)) return NO_DISPONIBLE
  return `${decimal1Formatter.format(valor)} %`
}

/** Formatea hectáreas con hasta dos decimales. */
export function formatHectareas(valor) {
  if (esFaltante(valor)) return NO_DISPONIBLE
  return `${decimal2Formatter.format(valor)} ha`
}

/** Formatea el puntaje de priorización con un decimal. */
export function formatPuntaje(valor) {
  if (esFaltante(valor)) return NO_DISPONIBLE
  return `${decimal1Formatter.format(valor)} puntos`
}

/** Formatea un puntaje sin la palabra "puntos", para ejes y celdas compactas. */
export function formatPuntajeCorto(valor) {
  if (esFaltante(valor)) return NO_DISPONIBLE
  return decimal1Formatter.format(valor)
}

export { NO_DISPONIBLE }
