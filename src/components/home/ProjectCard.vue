<template>
  <div
    class="group bg-white dark:bg-isa-navy-light rounded-2xl shadow-card hover:shadow-card-hover transition-shadow p-5 flex flex-col gap-4 border border-isa-gray-100 dark:border-isa-gray-800"
  >
    <div
      class="w-11 h-11 rounded-xl flex items-center justify-center"
      :style="{ backgroundColor: `${color}1A` }"
    >
      <svg class="w-6 h-6" :style="{ color }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15" />
      </svg>
    </div>

    <div class="flex-1">
      <h3 class="text-base font-semibold text-isa-navy dark:text-white">{{ proyecto.nombre }}</h3>
      <p class="text-sm text-isa-gray-500 dark:text-isa-gray-400 mt-1">{{ proyecto.descripcion }}</p>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-xs font-medium text-isa-gray-500 dark:text-isa-gray-400">
        <template v-if="veredas !== null">{{ veredas }} veredas</template>
        <template v-else>Cargando conteo...</template>
      </span>

      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-lg bg-isa-navy dark:bg-isa-blue text-white px-3 py-1.5 text-sm font-medium hover:bg-isa-blue transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-isa-blue"
        @click="$emit('seleccionar')"
      >
        Explorar proyecto
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  proyecto: { type: Object, required: true },
  veredas: { type: Number, default: null },
  color: { type: String, default: '#1959B8' },
})
defineEmits(['seleccionar'])
</script>
