import { ref, reactive, computed, watch } from 'vue'
import { obtenerManifest, obtenerDatosProyecto } from '../services/dataService'
import {
  crearFiltrosIniciales,
  aplicarFiltrosGlobales,
  obtenerDepartamentosDisponibles,
  obtenerMunicipiosDisponibles,
  obtenerNivelesSeguridadDisponibles,
} from '../utils/filtering'
import { calcularPuntajes } from '../utils/prioritization'
import { UMBRAL_INICIAL } from '../config/projects'

// ---------------------------------------------------------------------------
// Estado singleton compartido por toda la aplicación. Se define a nivel de
// módulo (en vez de usar Pinia) porque el volumen y la complejidad del
// estado no lo justifican; un conjunto de composables bien organizados es
// suficiente y evita una dependencia adicional.
// ---------------------------------------------------------------------------

const manifest = ref(null)
const estadoManifest = ref('idle') // idle | cargando | listo | error
const errorManifest = ref('')

const proyectoActual = ref(null)
const datosProyecto = ref([])
const estadoCarga = ref('idle') // idle | cargando | listo | error
const errorMensaje = ref('')

const pestañaActiva = ref('resumen') // resumen | veredal | impacto
const filtros = reactive(crearFiltrosIniciales())
const veredaSeleccionadaId = ref(null)
const umbral = ref(UMBRAL_INICIAL)

// ---------------------------------------------------------------------------
// Computados derivados (memoizados automáticamente por Vue)
// ---------------------------------------------------------------------------

const veredasFiltradas = computed(() => aplicarFiltrosGlobales(datosProyecto.value, filtros))

const departamentosDisponibles = computed(() =>
  obtenerDepartamentosDisponibles(datosProyecto.value)
)
const municipiosDisponibles = computed(() =>
  obtenerMunicipiosDisponibles(datosProyecto.value, filtros.departamentos)
)
const nivelesSeguridadDisponibles = computed(() =>
  obtenerNivelesSeguridadDisponibles(datosProyecto.value)
)

// Puntaje de priorización: se calcula sobre TODAS las veredas elegibles del
// proyecto (VSS_GIRASOLE > umbral), antes de aplicar los filtros globales.
const puntajesPorVereda = computed(() => calcularPuntajes(datosProyecto.value, umbral.value))

const veredasElegibles = computed(() =>
  datosProyecto.value.filter((f) => puntajesPorVereda.value.has(f.properties.VER_CCDGO))
)

// Las veredas elegibles, ya con los filtros globales aplicados solo para
// controlar qué se muestra (los puntajes no se recalculan con los filtros).
const veredasElegiblesFiltradas = computed(() =>
  aplicarFiltrosGlobales(veredasElegibles.value, filtros)
)

const veredaSeleccionada = computed(() => {
  if (!veredaSeleccionadaId.value) return null
  return (
    datosProyecto.value.find((f) => f.properties.VER_CCDGO === veredaSeleccionadaId.value) || null
  )
})

// Si la vereda seleccionada deja de cumplir los filtros globales, se limpia
// la selección automáticamente (sección 18.1 del brief).
watch(veredasFiltradas, (nuevasVisibles) => {
  if (!veredaSeleccionadaId.value) return
  const sigueVisible = nuevasVisibles.some(
    (f) => f.properties.VER_CCDGO === veredaSeleccionadaId.value
  )
  if (!sigueVisible) {
    veredaSeleccionadaId.value = null
  }
})

// Si cambian los departamentos seleccionados, se depuran los municipios que
// ya no pertenezcan al conjunto territorial permitido (sección 16.3).
watch(
  () => filtros.departamentos.slice(),
  () => {
    const disponibles = new Set(municipiosDisponibles.value)
    filtros.municipios = filtros.municipios.filter((m) => disponibles.has(m))
  }
)

// ---------------------------------------------------------------------------
// Acciones
// ---------------------------------------------------------------------------

async function cargarManifest() {
  if (estadoManifest.value === 'listo' || estadoManifest.value === 'cargando') return
  estadoManifest.value = 'cargando'
  errorManifest.value = ''
  try {
    manifest.value = await obtenerManifest()
    estadoManifest.value = 'listo'
  } catch (error) {
    errorManifest.value = error.message
    estadoManifest.value = 'error'
  }
}

function restablecerFiltros() {
  Object.assign(filtros, crearFiltrosIniciales())
}

async function seleccionarProyecto(proyecto) {
  proyectoActual.value = proyecto
  restablecerFiltros()
  veredaSeleccionadaId.value = null
  umbral.value = UMBRAL_INICIAL
  pestañaActiva.value = 'resumen'
  estadoCarga.value = 'cargando'
  errorMensaje.value = ''
  datosProyecto.value = []

  try {
    const features = await obtenerDatosProyecto(proyecto.archivoDatos)
    datosProyecto.value = features
    estadoCarga.value = 'listo'
  } catch (error) {
    errorMensaje.value = error.message
    estadoCarga.value = 'error'
  }
}

function volverAProyectos() {
  proyectoActual.value = null
  datosProyecto.value = []
  estadoCarga.value = 'idle'
  errorMensaje.value = ''
  veredaSeleccionadaId.value = null
  restablecerFiltros()
}

function actualizarFiltro(clave, valor) {
  filtros[clave] = valor
}

function limpiarFiltros() {
  restablecerFiltros()
}

function cambiarPestaña(id) {
  pestañaActiva.value = id
}

function seleccionarVereda(codigo) {
  veredaSeleccionadaId.value = codigo
}

function limpiarSeleccionVereda() {
  veredaSeleccionadaId.value = null
}

function actualizarUmbral(valor) {
  umbral.value = valor
}

export function useDashboardStore() {
  return {
    // Estado de manifiesto (pantalla de inicio)
    manifest,
    estadoManifest,
    errorManifest,
    cargarManifest,

    // Estado de proyecto y datos
    proyectoActual,
    datosProyecto,
    estadoCarga,
    errorMensaje,
    seleccionarProyecto,
    volverAProyectos,

    // Navegación
    pestañaActiva,
    cambiarPestaña,

    // Filtros
    filtros,
    actualizarFiltro,
    limpiarFiltros,
    departamentosDisponibles,
    municipiosDisponibles,
    nivelesSeguridadDisponibles,
    veredasFiltradas,

    // Selección de vereda
    veredaSeleccionadaId,
    veredaSeleccionada,
    seleccionarVereda,
    limpiarSeleccionVereda,

    // Priorización (ISA Impact)
    umbral,
    actualizarUmbral,
    puntajesPorVereda,
    veredasElegibles,
    veredasElegiblesFiltradas,
  }
}
