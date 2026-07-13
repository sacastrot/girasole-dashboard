<template>
  <div class="flex flex-col items-center justify-center gap-2 py-8 px-4 text-center">
    <svg
      class="w-8 h-8 text-isa-gray-400 dark:text-isa-gray-600"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.75 9.75h16.5M3.75 9.75a2.25 2.25 0 0 1 2.25-2.25h12a2.25 2.25 0 0 1 2.25 2.25M3.75 9.75v8.25a2.25 2.25 0 0 0 2.25 2.25h12a2.25 2.25 0 0 0 2.25-2.25V9.75M8.25 13.5h1.5m4.5 0h1.5"
      />
    </svg>
    <p class="text-sm text-isa-gray-600 dark:text-isa-gray-400 max-w-xs">{{ mensaje }}</p>
  </div>
</template>

<script setup>
defineProps({
  mensaje: { type: String, default: 'No hay información disponible para los filtros actuales.' },
})
</script>
