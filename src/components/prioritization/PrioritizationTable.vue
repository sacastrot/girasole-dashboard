<template>
  <div class="bg-white dark:bg-isa-navy-light rounded-xl shadow-card p-4 flex flex-col gap-3">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="text-sm font-semibold text-isa-navy dark:text-isa-gray-100">
        Tabla de priorización de electrificación rural
      </h3>
      <div class="relative">
        <svg class="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-isa-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          v-model="textoBusqueda"
          type="text"
          placeholder="Buscar en la tabla..."
          class="rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 bg-white dark:bg-isa-navy pl-8 pr-3 py-1.5 text-xs text-isa-gray-800 dark:text-isa-gray-200 placeholder:text-isa-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-isa-blue"
          aria-label="Buscar en la tabla de priorización"
        />
      </div>
    </div>

    <EmptyState v-if="!filas.length" mensaje="Sin resultados para los criterios de búsqueda y filtros actuales." />

    <template v-else>
      <div class="overflow-x-auto -mx-1">
        <table class="w-full text-xs sm:text-sm min-w-[900px]">
          <thead class="sticky top-0 bg-isa-gray-50 dark:bg-isa-navy z-10">
            <tr>
              <th
                v-for="header in tabla.getHeaderGroups()[0].headers"
                :key="header.id"
                class="text-left font-semibold text-isa-gray-600 dark:text-isa-gray-400 px-3 py-2 whitespace-nowrap cursor-pointer select-none"
                @click="header.column.getToggleSortingHandler()?.($event)"
              >
                <span class="inline-flex items-center gap-1">
                  <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                  <span v-if="header.column.getIsSorted() === 'asc'" aria-hidden="true">▲</span>
                  <span v-else-if="header.column.getIsSorted() === 'desc'" aria-hidden="true">▼</span>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in tabla.getRowModel().rows"
              :key="row.id"
              class="border-t border-isa-gray-100 dark:border-isa-gray-800 hover:bg-isa-gray-50 dark:hover:bg-isa-navy/60"
            >
              <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="px-3 py-2 whitespace-nowrap text-isa-gray-700 dark:text-isa-gray-300">
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-isa-gray-500 dark:text-isa-gray-400 pt-1">
        <span>
          Mostrando {{ inicioRango }}–{{ finRango }} de {{ filas.length }}
          {{ filas.length === 1 ? 'vereda' : 'veredas' }}
        </span>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 px-2.5 py-1 disabled:opacity-40"
            :disabled="!tabla.getCanPreviousPage()"
            @click="tabla.previousPage()"
          >
            Anterior
          </button>
          <span>Página {{ paginacion.pageIndex + 1 }} de {{ Math.max(tabla.getPageCount(), 1) }}</span>
          <button
            type="button"
            class="rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 px-2.5 py-1 disabled:opacity-40"
            :disabled="!tabla.getCanNextPage()"
            @click="tabla.nextPage()"
          >
            Siguiente
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, h } from 'vue'
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  FlexRender,
} from '@tanstack/vue-table'
import EmptyState from '../common/EmptyState.vue'
import {
  formatEntero,
  formatPorcentaje,
  formatDistanciaMetros,
  formatHectareas,
  formatPuntajeCorto,
} from '../../utils/formatters'
import { normalizarTexto } from '../../utils/text'

const props = defineProps({
  features: { type: Array, required: true },
  puntajes: { type: Map, required: true },
})

const textoBusqueda = ref('')

const CAMPOS_BUSQUEDA = ['VER_CCDGO', 'VEREDA', 'MUNICIPIO', 'DEPARTAMENTO', 'NIVEL_SEGURIDAD']

const datosCompletos = computed(() =>
  props.features.map((f) => {
    const p = f.properties
    const resultado = props.puntajes.get(p.VER_CCDGO)
    return {
      ...p,
      PUNTAJE_PRIORIZACION: resultado?.puntaje ?? 0,
      CALIFICACION_PRIORIDAD: resultado?.calificacion ?? 'Baja',
    }
  })
)

const filas = computed(() => {
  const texto = normalizarTexto(textoBusqueda.value.trim())
  if (!texto) return datosCompletos.value
  return datosCompletos.value.filter((fila) => {
    const coincideCampo = CAMPOS_BUSQUEDA.some((campo) => normalizarTexto(fila[campo]).includes(texto))
    const coincideCalificacion = normalizarTexto(fila.CALIFICACION_PRIORIDAD).includes(texto)
    return coincideCampo || coincideCalificacion
  })
})

function insigniaCalificacion(valor) {
  const colores = {
    Alta: 'bg-[#C1440E]/10 text-[#C1440E] dark:bg-[#C1440E]/20',
    Media: 'bg-[#F7941D]/10 text-[#F7941D] dark:bg-[#F7941D]/20',
    Baja: 'bg-isa-gray-200 text-isa-gray-600 dark:bg-isa-gray-800 dark:text-isa-gray-400',
  }
  return h(
    'span',
    { class: `inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${colores[valor] || ''}` },
    valor
  )
}

const columnas = [
  { accessorKey: 'VER_CCDGO', header: () => 'Código', cell: (i) => i.getValue() },
  { accessorKey: 'VEREDA', header: () => 'Vereda', cell: (i) => i.getValue() },
  { accessorKey: 'MUNICIPIO', header: () => 'Municipio', cell: (i) => i.getValue() },
  { accessorKey: 'DEPARTAMENTO', header: () => 'Departamento', cell: (i) => i.getValue() },
  { accessorKey: 'VSS_GIRASOLE', header: () => 'Viviendas sin energía', cell: (i) => formatEntero(i.getValue()) },
  { accessorKey: 'CANTIDAD_CONSEJOS', header: () => 'Consejos comunitarios', cell: (i) => formatEntero(i.getValue()) },
  { accessorKey: 'CANTIDAD_RESGUARDOS', header: () => 'Resguardos indígenas', cell: (i) => formatEntero(i.getValue()) },
  { accessorKey: 'RUNAP_TOTAL_PORCENTAJE', header: () => '% área protegida', cell: (i) => formatPorcentaje(i.getValue()) },
  { accessorKey: 'DISTANCIA_PROMEDIO_VIVIENDAS_VIAS', header: () => 'Distancia promedio a vías', cell: (i) => formatDistanciaMetros(i.getValue()) },
  { accessorKey: 'BUFFER_DISTRIBUCION_PORCENTAJE', header: () => '% distribución de energía', cell: (i) => formatPorcentaje(i.getValue()) },
  { accessorKey: 'NIVEL_SEGURIDAD', header: () => 'Nivel de seguridad', cell: (i) => i.getValue() },
  { accessorKey: 'CULTIVOS_ILICITOS_HA', header: () => 'Cultivos ilícitos', cell: (i) => formatHectareas(i.getValue()) },
  { accessorKey: 'PUNTAJE_PRIORIZACION', header: () => 'Puntaje', cell: (i) => formatPuntajeCorto(i.getValue()) },
  { accessorKey: 'CALIFICACION_PRIORIDAD', header: () => 'Calificación', cell: (i) => insigniaCalificacion(i.getValue()) },
]

const ordenamiento = ref([{ id: 'PUNTAJE_PRIORIZACION', desc: true }])
const paginacion = ref({ pageIndex: 0, pageSize: 10 })

const tabla = useVueTable({
  get data() {
    return filas.value
  },
  columns: columnas,
  state: {
    get sorting() {
      return ordenamiento.value
    },
    get pagination() {
      return paginacion.value
    },
  },
  onSortingChange: (actualizador) => {
    ordenamiento.value = typeof actualizador === 'function' ? actualizador(ordenamiento.value) : actualizador
  },
  onPaginationChange: (actualizador) => {
    paginacion.value = typeof actualizador === 'function' ? actualizador(paginacion.value) : actualizador
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
})

const inicioRango = computed(() =>
  filas.value.length ? paginacion.value.pageIndex * paginacion.value.pageSize + 1 : 0
)
const finRango = computed(() =>
  Math.min(filas.value.length, (paginacion.value.pageIndex + 1) * paginacion.value.pageSize)
)
</script>
