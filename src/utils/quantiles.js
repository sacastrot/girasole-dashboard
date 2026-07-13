/**
 * Escala secuencial usada para colorear las veredas en el mapa según
 * VSS_GIRASOLE (viviendas sin energía). Colores de menor a mayor necesidad,
 * en tonos cálidos coherentes con la identidad de Girasole.
 */
export const ESCALA_COLORES_MAPA = ['#FFF3D6', '#FFD98E', '#FDB913', '#F7941D', '#C1440E']

/**
 * Calcula cuantiles automáticos sobre un arreglo de valores numéricos.
 * Tolera pocos valores distintos deduplicando los cortes resultantes, de
 * forma que nunca se generen clases vacías o inválidas.
 *
 * @param {number[]} valores
 * @param {number} numClasesDeseadas
 * @returns {{cortes: number[], numClases: number}}
 */
export function calcularCuantiles(valores, numClasesDeseadas = 5) {
  if (!valores.length) return { cortes: [], numClases: 0 }

  const ordenados = [...valores].sort((a, b) => a - b)
  const min = ordenados[0]
  const max = ordenados[ordenados.length - 1]

  if (min === max) {
    return { cortes: [min, max], numClases: 1 }
  }

  const cortesBrutos = []
  for (let i = 0; i <= numClasesDeseadas; i++) {
    const posicion = (i / numClasesDeseadas) * (ordenados.length - 1)
    const inferior = Math.floor(posicion)
    const superior = Math.ceil(posicion)
    const fraccion = posicion - inferior
    const valor =
      ordenados[inferior] + (ordenados[superior] - ordenados[inferior]) * fraccion
    cortesBrutos.push(valor)
  }

  // Eliminar cortes duplicados (valores muy repetidos generan cuantiles iguales)
  const cortes = cortesBrutos.filter((valor, i) => i === 0 || valor > cortesBrutos[i - 1])

  return { cortes, numClases: cortes.length - 1 }
}

/** Devuelve el índice de clase (0-indexado) al que pertenece un valor. */
export function asignarClase(valor, cortes) {
  if (cortes.length < 2) return 0
  for (let i = 0; i < cortes.length - 1; i++) {
    const esUltimaClase = i === cortes.length - 2
    if (valor >= cortes[i] && (valor < cortes[i + 1] || esUltimaClase)) {
      return i
    }
  }
  return cortes.length - 2
}

/** Color asociado a una clase, ajustando la escala al número real de clases. */
export function colorDeClase(indiceClase, numClases) {
  if (numClases <= 1) return ESCALA_COLORES_MAPA[2]
  const escala = ESCALA_COLORES_MAPA
  const paso = (escala.length - 1) / Math.max(numClases - 1, 1)
  const indiceEscala = Math.round(indiceClase * paso)
  return escala[Math.min(indiceEscala, escala.length - 1)]
}
