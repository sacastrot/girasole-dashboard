<template>
  <div class="flex flex-col gap-4">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <ThresholdControl class="lg:col-span-1" />
      <MethodologyPanel class="lg:col-span-2" />
    </div>

    <div v-if="!elegiblesFiltradas.length" class="bg-white dark:bg-isa-navy-light rounded-xl shadow-card p-6">
      <EmptyState mensaje="Ninguna vereda supera actualmente el umbral mínimo de viviendas sin energía." />
    </div>

    <template v-else>
      <!-- 21. Tarjetas -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <MetricCard etiqueta="Veredas elegibles" :valor="formatEntero(elegiblesFiltradas.length)" />
        <MetricCard etiqueta="Viviendas sin energía (elegibles)" :valor="formatEntero(totalViviendasElegibles)" />
        <MetricCard etiqueta="Prioridad alta" :valor="formatEntero(calificacion.valores[0])" />
        <MetricCard etiqueta="Prioridad media" :valor="formatEntero(calificacion.valores[1])" />
        <MetricCard etiqueta="Prioridad baja" :valor="formatEntero(calificacion.valores[2])" />
      </div>

      <!-- 22. Gráficos -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard titulo="Estado de distribución de energía" descripcion="Veredas elegibles, según disponibilidad de distribución." :vacio="!distribucion.valores.some((v) => v > 0)">
          <EChartBase :opciones="opcionesDistribucion" height="260px" aria-label="Estado de distribución de energía en veredas elegibles" />
        </ChartCard>

        <ChartCard titulo="Distribución por nivel de seguridad" :vacio="!nivelSeguridad.categorias.length">
          <EChartBase :opciones="opcionesNivelSeguridad" height="260px" aria-label="Distribución por nivel de seguridad en veredas elegibles" />
        </ChartCard>

        <ChartCard titulo="Consejos comunitarios" descripcion="Veredas elegibles con y sin presencia de consejos comunitarios." :vacio="!elegiblesFiltradas.length">
          <EChartBase :opciones="opcionesConsejos" height="240px" aria-label="Consejos comunitarios en veredas elegibles" />
        </ChartCard>

        <ChartCard titulo="Resguardos indígenas" descripcion="Veredas elegibles con y sin presencia de resguardos indígenas." :vacio="!elegiblesFiltradas.length">
          <EChartBase :opciones="opcionesResguardos" height="240px" aria-label="Resguardos indígenas en veredas elegibles" />
        </ChartCard>

        <ChartCard titulo="Viviendas sin energía por municipio" descripcion="Suma de VSS_GIRASOLE en veredas elegibles." :vacio="!viviendasPorMunicipio.categorias.length">
          <EChartBase :opciones="opcionesViviendasPorMunicipio" height="280px" aria-label="Viviendas sin energía por municipio en veredas elegibles" />
        </ChartCard>

        <ChartCard titulo="Top 10 veredas por puntaje de priorización" :vacio="!top10.categorias.length">
          <EChartBase :opciones="opcionesTop10" height="320px" aria-label="Top 10 veredas por puntaje de priorización" />
        </ChartCard>

        <ChartCard titulo="Veredas elegibles por categoría de zona protegida" :vacio="!categoriasRunap.categorias.length">
          <EChartBase :opciones="opcionesCategoriasRunap" height="280px" aria-label="Veredas elegibles por categoría de zona protegida" />
        </ChartCard>

        <ChartCard titulo="Distribución por prioridad" descripcion="Veredas elegibles clasificadas en prioridad alta, media y baja." :vacio="!elegiblesFiltradas.length">
          <EChartBase :opciones="opcionesCalificacion" height="260px" aria-label="Distribución por prioridad" />
        </ChartCard>
      </div>

      <!-- 23. Tabla -->
      <PrioritizationTable :features="elegiblesFiltradas" :puntajes="puntajesPorVereda" />
    </template>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ThresholdControl from './ThresholdControl.vue'
import MethodologyPanel from './MethodologyPanel.vue'
import PrioritizationTable from './PrioritizationTable.vue'
import MetricCard from '../common/MetricCard.vue'
import ChartCard from '../common/ChartCard.vue'
import EmptyState from '../common/EmptyState.vue'
import EChartBase from '../charts/EChartBase.vue'
import { formatEntero } from '../../utils/formatters'
import { construirBarraHorizontal, construirBarraVerticalColoreada, construirDona } from '../../utils/chartOptions'
import {
  agruparYSumar,
  contarTriEstado,
  contarBooleano,
  contarCategoriasRunap,
  contarPorNivelSeguridad,
  topVeredasPorPuntaje,
  contarPorCalificacion,
  COLORES_TRIESTADO,
} from '../../utils/aggregations'
import { useDashboardStore } from '../../composables/useDashboardStore'

const props = defineProps({
  elegiblesFiltradas: { type: Array, required: true },
})

const { puntajesPorVereda } = useDashboardStore()

const totalViviendasElegibles = computed(() =>
  props.elegiblesFiltradas.reduce((acc, f) => acc + f.properties.VSS_GIRASOLE, 0)
)

const distribucion = computed(() => contarTriEstado(props.elegiblesFiltradas, 'DISTRIBUCION_ENERGIA_PRESENCIA'))
const opcionesDistribucion = computed(() =>
  construirDona(distribucion.value.categorias, distribucion.value.valores, COLORES_TRIESTADO, { unidad: 'veredas' })
)

const nivelSeguridad = computed(() => contarPorNivelSeguridad(props.elegiblesFiltradas))
const opcionesNivelSeguridad = computed(() =>
  construirBarraVerticalColoreada(nivelSeguridad.value.categorias, nivelSeguridad.value.valores, nivelSeguridad.value.colores, {
    unidad: 'veredas',
  })
)

const consejos = computed(() => contarBooleano(props.elegiblesFiltradas, 'CONSEJO_COMUNITARIO_PRESENCIA'))
const opcionesConsejos = computed(() =>
  construirDona(consejos.value.categorias, consejos.value.valores, ['#1959B8', '#DDE3EA'], { unidad: 'veredas' })
)

const resguardos = computed(() => contarBooleano(props.elegiblesFiltradas, 'RESGUARDO_INDIGENA_PRESENCIA'))
const opcionesResguardos = computed(() =>
  construirDona(resguardos.value.categorias, resguardos.value.valores, ['#F7941D', '#DDE3EA'], { unidad: 'veredas' })
)

const viviendasPorMunicipio = computed(() => agruparYSumar(props.elegiblesFiltradas, 'MUNICIPIO', 'VSS_GIRASOLE'))
const opcionesViviendasPorMunicipio = computed(() =>
  construirBarraHorizontal(viviendasPorMunicipio.value.categorias, viviendasPorMunicipio.value.valores, {
    unidad: 'viviendas',
    color: '#F7941D',
  })
)

const top10 = computed(() => topVeredasPorPuntaje(props.elegiblesFiltradas, puntajesPorVereda.value, 10))
const opcionesTop10 = computed(() =>
  construirBarraHorizontal(top10.value.categorias, top10.value.valores, {
    unidad: 'puntos',
    color: '#0B2545',
  })
)

const categoriasRunap = computed(() => contarCategoriasRunap(props.elegiblesFiltradas))
const opcionesCategoriasRunap = computed(() =>
  construirBarraHorizontal(categoriasRunap.value.categorias, categoriasRunap.value.valores, {
    unidad: 'veredas',
    color: '#1E9E5A',
  })
)

const calificacion = computed(() => contarPorCalificacion(props.elegiblesFiltradas, puntajesPorVereda.value))
const opcionesCalificacion = computed(() =>
  construirDona(calificacion.value.categorias, calificacion.value.valores, calificacion.value.colores, {
    unidad: 'veredas',
  })
)
</script>
