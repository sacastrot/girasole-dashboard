<template>
  <div>
    <DashboardTabs />
    <GlobalFilters />

    <main class="max-w-7xl mx-auto px-4 sm:px-6 py-5">
      <LoadingState v-if="estadoCarga === 'cargando'" mensaje="Cargando datos del proyecto..." />

      <ErrorState
        v-else-if="estadoCarga === 'error'"
        titulo="No fue posible cargar los datos del proyecto."
        :detalle="errorMensaje"
        mostrar-reintentar
        @reintentar="() => seleccionarProyecto(proyectoActual)"
      />

      <template v-else-if="estadoCarga === 'listo'">
        <ResumenGeneralSection v-if="pestañaActiva === 'resumen'" :features="veredasFiltradas" />
        <AnalisisVeredalSection v-else-if="pestañaActiva === 'veredal'" :features="veredasFiltradas" />
        <IsaImpactSection v-else-if="pestañaActiva === 'impacto'" :elegibles-filtradas="veredasElegiblesFiltradas" />
      </template>
    </main>
  </div>
</template>

<script setup>
import DashboardTabs from '../components/common/DashboardTabs.vue'
import GlobalFilters from '../components/filters/GlobalFilters.vue'
import LoadingState from '../components/common/LoadingState.vue'
import ErrorState from '../components/common/ErrorState.vue'
import ResumenGeneralSection from '../components/summary/ResumenGeneralSection.vue'
import AnalisisVeredalSection from '../components/village/AnalisisVeredalSection.vue'
import IsaImpactSection from '../components/prioritization/IsaImpactSection.vue'
import { useDashboardStore } from '../composables/useDashboardStore'

const {
  proyectoActual,
  estadoCarga,
  errorMensaje,
  seleccionarProyecto,
  pestañaActiva,
  veredasFiltradas,
  veredasElegiblesFiltradas,
} = useDashboardStore()
</script>
