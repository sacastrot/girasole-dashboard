<template>
  <div
    class="flex flex-col items-center justify-center gap-3 py-10 px-4 text-center rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900"
    role="alert"
  >
    <svg
      class="w-8 h-8 text-red-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M12 9v3.75m0 3.75h.008M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
    <p class="text-sm font-medium text-red-700 dark:text-red-300">{{ titulo }}</p>
    <p v-if="detalle" class="text-xs text-red-600 dark:text-red-400 max-w-sm">{{ detalle }}</p>
    <button
      v-if="mostrarReintentar"
      type="button"
      class="mt-1 text-xs font-medium text-red-700 dark:text-red-300 underline underline-offset-2 hover:text-red-900 dark:hover:text-red-100"
      @click="$emit('reintentar')"
    >
      Reintentar
    </button>
  </div>
</template>

<script setup>
defineProps({
  titulo: { type: String, default: 'No fue posible cargar la información.' },
  detalle: { type: String, default: '' },
  mostrarReintentar: { type: Boolean, default: false },
})
defineEmits(['reintentar'])
</script>
