/**
 * Estado inicial de los filtros globales. 'todos' representa la opción
 * "Todos" para filtros de selección única; un arreglo vacío representa
 * "Todos" para filtros de selección múltiple.
 */
export function crearFiltrosIniciales() {
  return {
    departamentos: [],
    municipios: [],
    pdet: 'todos',
    zomac: 'todos',
    isaAid: 'todos',
    nivelesSeguridad: [],
    areasProtegidas: 'todos',
    consejos: 'todos',
    resguardos: 'todos',
    cultivos: 'todos',
    distribucion: 'todos',
  }
}

function coincideTriEstado(valorFiltro, valorPropiedad) {
  // valorPropiedad es 'SI' | 'NO' | null (null = No disponible)
  if (valorFiltro === 'todos') return true
  if (valorFiltro === 'NO_DISPONIBLE') return valorPropiedad === null
  return valorPropiedad === valorFiltro
}

function coincidePresenciaBooleana(valorFiltro, presenciaBooleana) {
  if (valorFiltro === 'todos') return true
  if (valorFiltro === 'SI') return presenciaBooleana === true
  return presenciaBooleana === false
}

/**
 * Aplica los filtros globales sobre un arreglo de features GeoJSON.
 * Función pura: no muta los datos originales.
 */
export function aplicarFiltrosGlobales(features, filtros) {
  return features.filter((feature) => {
    const p = feature.properties

    if (filtros.departamentos.length > 0 && !filtros.departamentos.includes(p.DEPARTAMENTO)) {
      return false
    }
    if (filtros.municipios.length > 0 && !filtros.municipios.includes(p.MUNICIPIO)) {
      return false
    }
    if (filtros.pdet !== 'todos' && p.PDET !== filtros.pdet) return false
    if (filtros.zomac !== 'todos' && p.ZOMAC !== filtros.zomac) return false
    if (filtros.isaAid !== 'todos' && p.ISA_AID !== filtros.isaAid) return false
    if (
      filtros.nivelesSeguridad.length > 0 &&
      !filtros.nivelesSeguridad.includes(p.NIVEL_SEGURIDAD)
    ) {
      return false
    }
    if (!coincidePresenciaBooleana(filtros.areasProtegidas, p.AREA_PROTEGIDA_PRESENCIA)) {
      return false
    }
    if (!coincidePresenciaBooleana(filtros.consejos, p.CONSEJO_COMUNITARIO_PRESENCIA)) {
      return false
    }
    if (!coincidePresenciaBooleana(filtros.resguardos, p.RESGUARDO_INDIGENA_PRESENCIA)) {
      return false
    }
    if (!coincideTriEstado(filtros.cultivos, p.CULTIVOS_ILICITOS_PRESENCIA)) return false
    if (!coincideTriEstado(filtros.distribucion, p.DISTRIBUCION_ENERGIA_PRESENCIA)) return false

    return true
  })
}

/** Departamentos únicos presentes en el proyecto, ordenados alfabéticamente. */
export function obtenerDepartamentosDisponibles(features) {
  const set = new Set(features.map((f) => f.properties.DEPARTAMENTO))
  return [...set].sort((a, b) => a.localeCompare(b, 'es'))
}

/**
 * Municipios disponibles según los departamentos actualmente seleccionados
 * (sección 16.3: dependencia territorial). Si no hay departamentos
 * seleccionados, se muestran todos los municipios del proyecto.
 */
export function obtenerMunicipiosDisponibles(features, departamentosSeleccionados) {
  const relevantes =
    departamentosSeleccionados.length === 0
      ? features
      : features.filter((f) => departamentosSeleccionados.includes(f.properties.DEPARTAMENTO))
  const set = new Set(relevantes.map((f) => f.properties.MUNICIPIO))
  return [...set].sort((a, b) => a.localeCompare(b, 'es'))
}

/** Niveles de seguridad presentes en el proyecto, en orden lógico fijo. */
export function obtenerNivelesSeguridadDisponibles(features) {
  const orden = ['MUY BAJO', 'BAJO', 'MEDIO', 'ALTO']
  const presentes = new Set(features.map((f) => f.properties.NIVEL_SEGURIDAD))
  return orden.filter((n) => presentes.has(n))
}
