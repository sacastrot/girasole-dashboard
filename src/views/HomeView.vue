<template>
  <main class="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
    <section class="max-w-3xl">
      <p class="text-xs font-semibold uppercase tracking-wide text-girasole-orange mb-2">
        Dirección de Proyectos · ISA Interconexión Eléctrica S.A.
      </p>
      <h2 class="text-2xl sm:text-3xl font-semibold text-isa-navy dark:text-white leading-tight">
        Análisis territorial para la expansión y la electrificación rural
      </h2>
      <p class="mt-3 text-sm sm:text-base text-isa-gray-600 dark:text-isa-gray-400">
        Este dashboard permite conocer el área de influencia de cada proyecto futuro de ISA,
        analizar las condiciones de las veredas involucradas, identificar dónde ISA Impact puede
        apoyar procesos de electrificación rural y mitigación de riesgos, y priorizar la toma de decisiones.
      </p>

      <ul class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-isa-gray-600 dark:text-isa-gray-400">
        <li class="flex items-start gap-2">
          <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-isa-blue shrink-0"></span>
          Conocer el área de influencia de cada proyecto futuro.
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-isa-blue shrink-0"></span>
          Analizar las condiciones de las veredas.
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-girasole-orange shrink-0"></span>
          Identificar dónde ISA Impact puede apoyar al proyecto.
        </li>
        <li class="flex items-start gap-2">
          <span class="mt-1.5 w-1.5 h-1.5 rounded-full bg-girasole-orange shrink-0"></span>
          Apoyar la mitigación de riesgos y la priorización de electrificación rural.
        </li>
      </ul>
    </section>

    <section>
      <h3 class="text-sm font-semibold text-isa-gray-500 dark:text-isa-gray-400 uppercase tracking-wide mb-3">
        Seleccione un proyecto
      </h3>

      <LoadingState v-if="estadoManifest === 'cargando'" mensaje="Cargando proyectos disponibles..." />
      <ErrorState
        v-else-if="estadoManifest === 'error'"
        titulo="No fue posible cargar la información de los proyectos."
        :detalle="errorManifest"
        mostrar-reintentar
        @reintentar="cargarManifest"
      />
      <ProjectSelector v-else />
    </section>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import ProjectSelector from '../components/home/ProjectSelector.vue'
import LoadingState from '../components/common/LoadingState.vue'
import ErrorState from '../components/common/ErrorState.vue'
import { useDashboardStore } from '../composables/useDashboardStore'

const { estadoManifest, errorManifest, cargarManifest } = useDashboardStore()

onMounted(() => {
  cargarManifest()
})
</script>
