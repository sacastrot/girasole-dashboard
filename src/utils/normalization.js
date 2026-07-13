/**
 * Normalización min-max, usada por el puntaje de priorización.
 * Cuando máximo === mínimo, la convención del proyecto es asignar 50 puntos
 * a todas las veredas válidas de ese componente (ver sección 20.3 del brief).
 */

export function normalizarDirecto(valor, minimo, maximo) {
  if (minimo === maximo) return 50
  return ((valor - minimo) / (maximo - minimo)) * 100
}

export function normalizarInvertido(valor, minimo, maximo) {
  if (minimo === maximo) return 50
  return ((maximo - valor) / (maximo - minimo)) * 100
}

/** Limita un número al rango [0, 100]. */
export function limitarRango(valor) {
  return Math.min(100, Math.max(0, valor))
}
