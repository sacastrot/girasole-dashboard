<template>
  <header
    class="sticky top-0 z-30 bg-white/95 dark:bg-isa-navy/95 backdrop-blur border-b border-isa-gray-200 dark:border-isa-gray-800"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <img
          v-if="!errorLogo"
          :src="rutaLogo"
          alt="Logo de Girasole"
          class="h-9 w-9 object-contain shrink-0"
          @error="errorLogo = true"
        />
        <span
          v-else
          class="h-9 w-9 shrink-0 rounded-lg bg-girasole-orange/10 text-girasole-orange flex items-center justify-center text-sm font-bold"
          aria-hidden="true"
        >
          GS
        </span>

        <div class="min-w-0">
          <p class="text-[11px] font-medium text-isa-gray-500 dark:text-isa-gray-400 leading-none">
            {{ errorLogo ? 'Girasole' : 'ISA Interconexión Eléctrica · Girasole' }}
          </p>
          <h1
            class="text-sm sm:text-base font-semibold text-isa-navy dark:text-white truncate leading-tight"
          >
            Dashboard plan de expansión ISA
          </h1>
        </div>
      </div>

      <div class="ml-auto flex items-center gap-2 shrink-0">
        <button
          v-if="proyectoActual"
          type="button"
          class="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 px-3 py-1.5 text-xs font-medium text-isa-gray-700 dark:text-isa-gray-300 hover:bg-isa-gray-100 dark:hover:bg-isa-navy-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-isa-blue transition-colors"
          @click="volverAProyectos"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Cambiar proyecto
        </button>
        <InternalUseBadge />
        <ThemeToggle />
      </div>
    </div>

    <button
      v-if="proyectoActual"
      type="button"
      class="sm:hidden w-full flex items-center justify-center gap-1.5 border-t border-isa-gray-200 dark:border-isa-gray-800 px-3 py-2 text-xs font-medium text-isa-gray-700 dark:text-isa-gray-300"
      @click="volverAProyectos"
    >
      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
      </svg>
      Cambiar proyecto
    </button>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import InternalUseBadge from './InternalUseBadge.vue'
import ThemeToggle from './ThemeToggle.vue'
import { useDashboardStore } from '../../composables/useDashboardStore'

const errorLogo = ref(false)
const rutaLogo = `${import.meta.env.BASE_URL}assets/logo-girasole.png`

const { proyectoActual, volverAProyectos } = useDashboardStore()
</script>
