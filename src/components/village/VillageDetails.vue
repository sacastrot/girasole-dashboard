<template>
  <div v-if="!vereda" class="h-full flex items-center justify-center">
    <EmptyState mensaje="Seleccione una vereda en el mapa o utilice el buscador para consultar su ficha." />
  </div>

  <div v-else class="flex flex-col gap-4 overflow-y-auto max-h-full pr-1">
    <!-- A. Identificación -->
    <section>
      <h3 class="text-base font-semibold text-isa-navy dark:text-white">{{ p.VEREDA }}</h3>
      <p class="text-sm text-isa-gray-500 dark:text-isa-gray-400">
        {{ p.MUNICIPIO }}, {{ p.DEPARTAMENTO }} · Código {{ p.VER_CCDGO }}
      </p>
    </section>

    <!-- B. Energía e infraestructura -->
    <FichaBloque titulo="Energía e infraestructura">
      <FichaFila etiqueta="Viviendas sin energía" :valor="formatEntero(p.VSS_GIRASOLE)" />
      <FichaFila etiqueta="Estado de distribución" :valor="estadoDistribucion" />
      <FichaFila etiqueta="Longitud de líneas de distribución" :valor="formatDistanciaMetros(p.LONGITUD_LINEAS_DISTRIBUCION)" />
      <FichaFila etiqueta="Buffer de distribución" :valor="formatPorcentaje(p.BUFFER_DISTRIBUCION_PORCENTAJE)" />
      <FichaFila etiqueta="Techos dentro del buffer" :valor="formatPorcentaje(p.BUFFER_DISTRIBUCION_PORCENTAJE_TECHOS_DENTRO)" />
      <FichaFila etiqueta="Techos fuera del buffer" :valor="formatPorcentaje(p.BUFFER_DISTRIBUCION_PORCENTAJE_TECHOS_FUERA)" />
      <FichaFila etiqueta="ISA AID" :valor="p.ISA_AID === 'SI' ? 'Sí' : 'No'" />
    </FichaBloque>

    <!-- C. Accesibilidad vial -->
    <FichaBloque titulo="Accesibilidad vial">
      <FichaFila etiqueta="Distancia promedio a vías" :valor="formatDistanciaMetros(p.DISTANCIA_PROMEDIO_VIVIENDAS_VIAS)" />
      <FichaFila etiqueta="Distancia mínima a vías" :valor="formatDistanciaMetros(p.DISTANCIA_MINIMA_VIVIENDAS_VIAS)" />
      <FichaFila etiqueta="Distancia máxima a vías" :valor="formatDistanciaMetros(p.DISTANCIA_MAXIMA_VIVIENDAS_VIAS)" />
    </FichaBloque>

    <!-- D. Cultivos ilícitos -->
    <FichaBloque titulo="Cultivos ilícitos">
      <FichaFila etiqueta="Presencia" :valor="presenciaCultivos" />
      <FichaFila etiqueta="Área con cultivos ilícitos" :valor="formatHectareas(p.CULTIVOS_ILICITOS_HA)" />
      <FichaFila etiqueta="Porcentaje del área veredal" :valor="formatPorcentaje(p.CULTIVOS_ILICITOS_PORCENTAJE)" />
    </FichaBloque>

    <!-- E. Condición territorial -->
    <FichaBloque titulo="Condición territorial">
      <FichaFila etiqueta="PDET" :valor="p.PDET === 'SI' ? 'Sí' : 'No'" />
      <FichaFila etiqueta="ZOMAC" :valor="p.ZOMAC === 'SI' ? 'Sí' : 'No'" />
    </FichaBloque>

    <!-- F. Áreas protegidas por categoría -->
    <FichaBloque titulo="Áreas protegidas por categoría">
      <p v-if="!p.runapCategorias.length" class="text-sm text-isa-gray-500 dark:text-isa-gray-400">
        No se registra presencia en esta vereda.
      </p>
      <template v-else>
        <FichaFila etiqueta="Porcentaje total de área protegida" :valor="formatPorcentaje(p.RUNAP_TOTAL_PORCENTAJE)" />
        <EChartBase :opciones="opcionesCategoriasRunap" height="180px" aria-label="Áreas protegidas por categoría" />
      </template>
    </FichaBloque>

    <!-- G. Áreas protegidas por nombre -->
    <FichaBloque titulo="Áreas protegidas por nombre">
      <p v-if="!p.runapNombres.length" class="text-sm text-isa-gray-500 dark:text-isa-gray-400">
        No se registra presencia en esta vereda.
      </p>
      <EChartBase v-else :opciones="opcionesNombresRunap" height="200px" aria-label="Áreas protegidas por nombre" />
    </FichaBloque>

    <!-- H. Consejos comunitarios -->
    <FichaBloque titulo="Consejos comunitarios">
      <p v-if="!p.consejosComunitarios.length" class="text-sm text-isa-gray-500 dark:text-isa-gray-400">
        No se registra presencia en esta vereda.
      </p>
      <template v-else>
        <FichaFila etiqueta="Cantidad de consejos" :valor="formatEntero(p.CANTIDAD_CONSEJOS)" />
        <FichaFila etiqueta="Porcentaje total de área" :valor="formatPorcentaje(p.CONSEJO_TOTAL_PORCENTAJE)" />
        <EChartBase :opciones="opcionesConsejos" height="160px" aria-label="Consejos comunitarios" />
      </template>
    </FichaBloque>

    <!-- I. Resguardos indígenas -->
    <FichaBloque titulo="Resguardos indígenas">
      <p v-if="!p.resguardosIndigenas.length" class="text-sm text-isa-gray-500 dark:text-isa-gray-400">
        No se registra presencia en esta vereda.
      </p>
      <template v-else>
        <FichaFila etiqueta="Cantidad de resguardos" :valor="formatEntero(p.CANTIDAD_RESGUARDOS)" />
        <FichaFila etiqueta="Porcentaje total de área" :valor="formatPorcentaje(p.RESGUARDO_TOTAL_PORCENTAJE)" />
        <EChartBase :opciones="opcionesResguardos" height="160px" aria-label="Resguardos indígenas" />
      </template>
    </FichaBloque>

    <!-- J. Seguridad -->
    <FichaBloque titulo="Seguridad">
      <FichaFila etiqueta="Nivel de seguridad" :valor="p.NIVEL_SEGURIDAD" />
      <div class="mt-1 flex items-center gap-1" role="img" :aria-label="`Nivel de seguridad: ${p.NIVEL_SEGURIDAD}`">
        <span
          v-for="nivel in nivelesOrdenados"
          :key="nivel"
          class="h-2 flex-1 rounded-full"
          :class="nivel === p.NIVEL_SEGURIDAD ? '' : 'opacity-25'"
          :style="{ backgroundColor: coloresSeguridad[nivel] }"
        ></span>
      </div>
      <div class="flex justify-between text-[10px] text-isa-gray-400 mt-1">
        <span>Muy bajo</span><span>Bajo</span><span>Medio</span><span>Alto</span>
      </div>
    </FichaBloque>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'
import EmptyState from '../common/EmptyState.vue'
import EChartBase from '../charts/EChartBase.vue'
import { formatEntero, formatDistanciaMetros, formatPorcentaje, formatHectareas } from '../../utils/formatters'
import { construirBarraHorizontal } from '../../utils/chartOptions'

const props = defineProps({
  vereda: { type: Object, default: null },
})

const p = computed(() => props.vereda?.properties ?? null)

const estadoDistribucion = computed(() => {
  const v = p.value?.DISTRIBUCION_ENERGIA_PRESENCIA
  if (v === 'SI') return 'Con distribución'
  if (v === 'NO') return 'Sin distribución'
  return 'No disponible'
})

const presenciaCultivos = computed(() => {
  const v = p.value?.CULTIVOS_ILICITOS_PRESENCIA
  if (v === 'SI') return 'Sí'
  if (v === 'NO') return 'No'
  return 'No disponible'
})

const nivelesOrdenados = ['MUY BAJO', 'BAJO', 'MEDIO', 'ALTO']
const coloresSeguridad = {
  'MUY BAJO': '#1E9E5A',
  BAJO: '#7CB518',
  MEDIO: '#F2A900',
  ALTO: '#D64545',
}

const opcionesCategoriasRunap = computed(() =>
  construirBarraHorizontal(
    p.value.runapCategorias.map((c) => c.nombre),
    p.value.runapCategorias.map((c) => c.porcentaje),
    { unidad: '%', color: '#1959B8' }
  )
)

const opcionesNombresRunap = computed(() =>
  construirBarraHorizontal(
    p.value.runapNombres.map((n) => `${n.nombre} (${n.categoria})`),
    p.value.runapNombres.map((n) => n.porcentaje),
    { unidad: '%', color: '#1959B8' }
  )
)

const opcionesConsejos = computed(() =>
  construirBarraHorizontal(
    p.value.consejosComunitarios.map((c) => c.nombre),
    p.value.consejosComunitarios.map((c) => c.porcentaje),
    { unidad: '%', color: '#F7941D' }
  )
)

const opcionesResguardos = computed(() =>
  construirBarraHorizontal(
    p.value.resguardosIndigenas.map((r) => r.nombre),
    p.value.resguardosIndigenas.map((r) => r.porcentaje),
    { unidad: '%', color: '#F7941D' }
  )
)

// Sub-componentes locales muy pequeños para evitar archivos adicionales
const FichaBloque = (props, { slots }) =>
  h('section', { class: 'border-t border-isa-gray-100 dark:border-isa-gray-800 pt-3' }, [
    h('h4', { class: 'text-sm font-semibold text-isa-navy dark:text-isa-gray-100 mb-2' }, props.titulo),
    h('div', { class: 'flex flex-col gap-1.5' }, slots.default?.()),
  ])
FichaBloque.props = ['titulo']

const FichaFila = (props) =>
  h('div', { class: 'flex justify-between gap-3 text-sm' }, [
    h('span', { class: 'text-isa-gray-500 dark:text-isa-gray-400' }, props.etiqueta),
    h('span', { class: 'font-medium text-isa-gray-800 dark:text-isa-gray-200 text-right' }, props.valor),
  ])
FichaFila.props = ['etiqueta', 'valor']
</script>
