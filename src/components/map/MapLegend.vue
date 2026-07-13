<template>
  <div
    class="absolute rounded-lg bg-white/95 dark:bg-isa-navy-light/95 backdrop-blur border border-isa-gray-200 dark:border-isa-gray-800 shadow-card px-3 py-2 text-xs max-w-[200px]"
  >
    <p class="font-semibold text-isa-navy dark:text-isa-gray-100 mb-1.5">{{ titulo }}</p>
    <ul class="space-y-1">
      <li v-for="(item, i) in items" :key="i" class="flex items-center gap-2">
        <span
          class="w-3 h-3 rounded-sm shrink-0 border border-black/10"
          :style="{ backgroundColor: item.color }"
          aria-hidden="true"
        ></span>
        <span class="text-isa-gray-600 dark:text-isa-gray-400 truncate">{{ item.etiqueta }}</span>
        <span class="ml-auto font-medium text-isa-gray-700 dark:text-isa-gray-300">
          {{ item.conteo }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup>
defineProps({
  titulo: { type: String, default: 'Viviendas sin energía' },
  items: { type: Array, default: () => [] },
})
</script>
