<template>
  <nav
    class="border-b border-isa-gray-200 dark:border-isa-gray-800 bg-white dark:bg-isa-navy overflow-x-auto"
    aria-label="Secciones del dashboard"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex gap-1">
      <button
        v-for="pestaña in pestañas"
        :key="pestaña.id"
        type="button"
        class="relative px-3 sm:px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-isa-blue"
        :class="
          pestañaActiva === pestaña.id
            ? 'text-isa-blue dark:text-isa-blue-light'
            : 'text-isa-gray-600 dark:text-isa-gray-400 hover:text-isa-navy dark:hover:text-isa-gray-200'
        "
        :aria-current="pestañaActiva === pestaña.id ? 'page' : undefined"
        @click="cambiarPestaña(pestaña.id)"
      >
        {{ pestaña.etiqueta }}
        <span
          v-if="pestañaActiva === pestaña.id"
          class="absolute left-0 right-0 -bottom-px h-0.5 bg-isa-blue dark:bg-isa-blue-light rounded-t"
          aria-hidden="true"
        ></span>
      </button>
    </div>
  </nav>
</template>

<script setup>
import { useDashboardStore } from '../../composables/useDashboardStore'

const { pestañaActiva, cambiarPestaña } = useDashboardStore()

const pestañas = [
  { id: 'resumen', etiqueta: 'Resumen General' },
  { id: 'veredal', etiqueta: 'Análisis Veredal' },
  { id: 'impacto', etiqueta: 'ISA Impact' },
]
</script>
