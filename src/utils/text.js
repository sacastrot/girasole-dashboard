/** Normaliza texto para comparaciones de búsqueda: minúsculas y sin tildes. */
export function normalizarTexto(texto) {
  if (!texto) return ''
  return texto
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Escapa caracteres HTML especiales antes de insertar texto en innerHTML. */
export function escaparHtml(texto) {
  if (texto === null || texto === undefined) return ''
  return texto
    .toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
