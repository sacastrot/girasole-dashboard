<template>
  <div
    class="bg-white dark:bg-isa-navy-light rounded-xl shadow-card p-4 flex flex-col gap-1 min-w-0 overflow-x-auto"
  >
    <span class="text-xs font-medium text-isa-gray-600 dark:text-isa-gray-400 truncate">
      {{ etiqueta }}
    </span>
    <span class="text-2xl font-semibold text-isa-navy dark:text-white leading-tight truncate">
      {{ valor }}
    </span>
    <span v-if="ayuda" class="text-xs text-isa-gray-400 dark:text-isa-gray-500">{{ ayuda }}</span>
  </div>
</template>

<script setup>
defineProps({
  etiqueta: { type: String, required: true },
  valor: { type: [String, Number], required: true },
  ayuda: { type: String, default: '' },
})
</script>
