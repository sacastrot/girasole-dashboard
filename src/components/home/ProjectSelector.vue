<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <ProjectCard
      v-for="proyecto in proyectosConConteo"
      :key="proyecto.id"
      :proyecto="proyecto"
      :veredas="proyecto.veredas"
      :color="colorAcento(proyecto.acento)"
      @seleccionar="seleccionarProyecto(proyecto)"
    />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import ProjectCard from './ProjectCard.vue'
import { PROYECTOS } from '../../config/projects'
import { useDashboardStore } from '../../composables/useDashboardStore'

const { manifest, seleccionarProyecto } = useDashboardStore()

const MAPA_COLORES = {
  'girasole-orange': '#F7941D',
  'isa-blue': '#1959B8',
  'girasole-yellow': '#FDB913',
  'isa-navy': '#0B2545',
}

function colorAcento(clave) {
  return MAPA_COLORES[clave] || '#1959B8'
}

const proyectosConConteo = computed(() =>
  PROYECTOS.map((proyecto) => {
    const entradaManifest = manifest.value?.proyectos?.find((p) => p.id === proyecto.id)
    return { ...proyecto, veredas: entradaManifest?.veredas ?? null }
  })
)
</script>
