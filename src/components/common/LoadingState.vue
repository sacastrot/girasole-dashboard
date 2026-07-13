<template>
  <div class="flex flex-col items-center justify-center gap-3 py-12 px-4 text-center" role="status">
    <span
      class="w-8 h-8 rounded-full border-2 border-isa-gray-200 dark:border-isa-gray-800 border-t-isa-blue animate-spin"
      aria-hidden="true"
    ></span>
    <p class="text-sm text-isa-gray-600 dark:text-isa-gray-400">{{ mensaje }}</p>
  </div>
</template>

<script setup>
defineProps({
  mensaje: { type: String, default: 'Cargando información...' },
})
</script>
