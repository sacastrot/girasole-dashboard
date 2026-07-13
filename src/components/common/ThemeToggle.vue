<template>
  <button
    type="button"
    class="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 text-isa-gray-600 dark:text-isa-gray-300 hover:bg-isa-gray-100 dark:hover:bg-isa-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-isa-blue transition-colors"
    :aria-label="tema === 'claro' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'"
    @click="alternarTema"
  >
    <svg
      v-if="tema === 'claro'"
      class="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
      />
    </svg>
    <svg
      v-else
      class="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21M7.227 19.773l-1.591-1.591M5.25 12H3m2.386-6.364 1.591 1.591M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
      />
    </svg>
  </button>
</template>

<script setup>
import { useTheme } from '../../composables/useTheme'

const { tema, alternarTema } = useTheme()
</script>
