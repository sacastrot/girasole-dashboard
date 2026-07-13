<template>
  <div class="flex flex-col gap-4">
    <!-- 17.1 Tarjetas -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
      <MetricCard etiqueta="Total de veredas" :valor="formatEntero(metricas.totalVeredas)" />
      <MetricCard etiqueta="Total de municipios" :valor="formatEntero(metricas.totalMunicipios)" />
      <MetricCard etiqueta="Total de departamentos" :valor="formatEntero(metricas.totalDepartamentos)" />
      <MetricCard etiqueta="Viviendas sin energía" :valor="formatEntero(metricas.viviendasSinEnergia)" />
      <MetricCard etiqueta="Cultivos ilícitos" :valor="formatHectareas(metricas.hectareasCultivosIlicitos)" />
      <MetricCard etiqueta="Distancia promedio a vías" :valor="formatDistanciaMetros(metricas.distanciaPromedio)" />
      <MetricCard etiqueta="Veredas con áreas protegidas" :valor="formatEntero(metricas.veredasAreasProtegidas)" />
      <MetricCard etiqueta="Veredas con consejos" :valor="formatEntero(metricas.veredasConsejos)" />
      <MetricCard etiqueta="Veredas con resguardos" :valor="formatEntero(metricas.veredasResguardos)" />
      <MetricCard etiqueta="Con distribución de energía" :valor="formatEntero(metricas.veredasConDistribucion)" />
      <MetricCard etiqueta="Sin distribución de energía" :valor="formatEntero(metricas.veredasSinDistribucion)" />
      <MetricCard etiqueta="Distribución no disponible" :valor="formatEntero(metricas.veredasDistribucionNoDisponible)" />
    </div>

    <!-- 17.2 Gráficos -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <ChartCard titulo="Veredas por municipio" descripcion="Cantidad de veredas del área de influencia en cada municipio." :vacio="!veredasPorMunicipio.categorias.length">
        <EChartBase :opciones="opcionesVeredasPorMunicipio" height="280px" aria-label="Veredas por municipio" />
      </ChartCard>

      <ChartCard titulo="Viviendas sin energía por municipio" descripcion="Suma de VSS_GIRASOLE por municipio." :vacio="!viviendasPorMunicipio.categorias.length">
        <EChartBase :opciones="opcionesViviendasPorMunicipio" height="280px" aria-label="Viviendas sin energía por municipio" />
      </ChartCard>

      <ChartCard titulo="Estado de distribución de energía" descripcion="Veredas con distribución, sin distribución y sin información disponible." :vacio="!distribucion.valores.some((v) => v > 0)">
        <EChartBase :opciones="opcionesDistribucion" height="260px" aria-label="Estado de distribución de energía" />
      </ChartCard>

      <ChartCard titulo="Veredas por categoría de zona protegida" descripcion="Una vereda puede aportar a varias categorías RUNAP." :vacio="!categoriasRunap.categorias.length">
        <EChartBase :opciones="opcionesCategoriasRunap" height="280px" aria-label="Veredas por categoría de zona protegida" />
      </ChartCard>

      <ChartCard titulo="Distancia promedio a vías por municipio" descripcion="Promedio de DISTANCIA_PROMEDIO_VIVIENDAS_VIAS con datos válidos." :vacio="!distanciaPorMunicipio.categorias.length">
        <EChartBase :opciones="opcionesDistanciaPorMunicipio" height="280px" aria-label="Distancia promedio a vías por municipio" />
      </ChartCard>

      <ChartCard titulo="Distribución PDET" :vacio="!filtradas.length">
        <EChartBase :opciones="opcionesPdet" height="240px" aria-label="Distribución PDET" />
      </ChartCard>

      <ChartCard titulo="Distribución ZOMAC" :vacio="!filtradas.length">
        <EChartBase :opciones="opcionesZomac" height="240px" aria-label="Distribución ZOMAC" />
      </ChartCard>

      <ChartCard titulo="Consejos comunitarios y resguardos indígenas" descripcion="Veredas con y sin presencia territorial." :vacio="!filtradas.length">
        <EChartBase :opciones="opcionesEtnico" height="260px" aria-label="Consejos comunitarios y resguardos indígenas" />
      </ChartCard>

      <ChartCard titulo="Distribución por nivel de seguridad" :vacio="!nivelSeguridad.categorias.length">
        <EChartBase :opciones="opcionesNivelSeguridad" height="260px" aria-label="Distribución por nivel de seguridad" />
      </ChartCard>

      <ChartCard titulo="Cultivos ilícitos por municipio" descripcion="Veredas con presencia, sin presencia y sin información disponible." :vacio="!cultivosPorMunicipio.categorias.length">
        <EChartBase :opciones="opcionesCultivosPorMunicipio" height="280px" aria-label="Cultivos ilícitos por municipio" />
      </ChartCard>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import MetricCard from '../common/MetricCard.vue'
import ChartCard from '../common/ChartCard.vue'
import EChartBase from '../charts/EChartBase.vue'
import { formatEntero, formatHectareas, formatDistanciaMetros } from '../../utils/formatters'
import {
  construirBarraHorizontal,
  construirBarrasApiladasHorizontal,
  construirBarrasAgrupadasVertical,
  construirBarraVerticalColoreada,
  construirDona,
} from '../../utils/chartOptions'
import {
  calcularMetricasResumen,
  agruparYContar,
  agruparYSumar,
  agruparYPromediar,
  contarTriEstado,
  contarSiNo,
  contarBooleano,
  contarCategoriasRunap,
  contarPorNivelSeguridad,
  contarTriEstadoPorMunicipio,
  COLORES_TRIESTADO,
} from '../../utils/aggregations'

const props = defineProps({
  features: { type: Array, required: true },
})

const filtradas = computed(() => props.features)

const metricas = computed(() => calcularMetricasResumen(filtradas.value))

const veredasPorMunicipio = computed(() => agruparYContar(filtradas.value, 'MUNICIPIO'))
const opcionesVeredasPorMunicipio = computed(() =>
  construirBarraHorizontal(veredasPorMunicipio.value.categorias, veredasPorMunicipio.value.valores, {
    unidad: 'veredas',
    color: '#1959B8',
  })
)

const viviendasPorMunicipio = computed(() => agruparYSumar(filtradas.value, 'MUNICIPIO', 'VSS_GIRASOLE'))
const opcionesViviendasPorMunicipio = computed(() =>
  construirBarraHorizontal(viviendasPorMunicipio.value.categorias, viviendasPorMunicipio.value.valores, {
    unidad: 'viviendas',
    color: '#F7941D',
  })
)

const distribucion = computed(() => contarTriEstado(filtradas.value, 'DISTRIBUCION_ENERGIA_PRESENCIA'))
const opcionesDistribucion = computed(() =>
  construirDona(distribucion.value.categorias, distribucion.value.valores, COLORES_TRIESTADO, {
    unidad: 'veredas',
  })
)

const categoriasRunap = computed(() => contarCategoriasRunap(filtradas.value))
const opcionesCategoriasRunap = computed(() =>
  construirBarraHorizontal(categoriasRunap.value.categorias, categoriasRunap.value.valores, {
    unidad: 'veredas',
    color: '#1E9E5A',
  })
)

const distanciaPorMunicipio = computed(() =>
  agruparYPromediar(filtradas.value, 'MUNICIPIO', 'DISTANCIA_PROMEDIO_VIVIENDAS_VIAS')
)
const opcionesDistanciaPorMunicipio = computed(() =>
  construirBarraHorizontal(distanciaPorMunicipio.value.categorias, distanciaPorMunicipio.value.valores, {
    unidad: 'm',
    color: '#123F87',
  })
)

const pdet = computed(() => contarSiNo(filtradas.value, 'PDET'))
const opcionesPdet = computed(() =>
  construirDona(pdet.value.categorias, pdet.value.valores, ['#1959B8', '#DDE3EA'], { unidad: 'veredas' })
)

const zomac = computed(() => contarSiNo(filtradas.value, 'ZOMAC'))
const opcionesZomac = computed(() =>
  construirDona(zomac.value.categorias, zomac.value.valores, ['#F7941D', '#DDE3EA'], { unidad: 'veredas' })
)

const consejos = computed(() => contarBooleano(filtradas.value, 'CONSEJO_COMUNITARIO_PRESENCIA'))
const resguardos = computed(() => contarBooleano(filtradas.value, 'RESGUARDO_INDIGENA_PRESENCIA'))
const opcionesEtnico = computed(() =>
  construirBarrasAgrupadasVertical(
    ['Consejos comunitarios', 'Resguardos indígenas'],
    [
      { nombre: 'Con presencia', data: [consejos.value.valores[0], resguardos.value.valores[0]], color: '#1959B8' },
      { nombre: 'Sin presencia', data: [consejos.value.valores[1], resguardos.value.valores[1]], color: '#DDE3EA' },
    ],
    { unidad: 'veredas' }
  )
)

const nivelSeguridad = computed(() => contarPorNivelSeguridad(filtradas.value))
const opcionesNivelSeguridad = computed(() =>
  construirBarraVerticalColoreada(nivelSeguridad.value.categorias, nivelSeguridad.value.valores, nivelSeguridad.value.colores, {
    unidad: 'veredas',
  })
)

const cultivosPorMunicipio = computed(() =>
  contarTriEstadoPorMunicipio(filtradas.value, 'CULTIVOS_ILICITOS_PRESENCIA')
)
const opcionesCultivosPorMunicipio = computed(() =>
  construirBarrasApiladasHorizontal(cultivosPorMunicipio.value.categorias, cultivosPorMunicipio.value.series, {
    unidad: 'veredas',
  })
)
</script>
