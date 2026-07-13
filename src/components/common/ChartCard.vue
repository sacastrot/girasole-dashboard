<template>
  <div class="bg-white dark:bg-isa-navy-light rounded-xl shadow-card p-4 flex flex-col gap-2 min-w-0">
    <div>
      <h3 class="text-sm font-semibold text-isa-navy dark:text-isa-gray-100">{{ titulo }}</h3>
      <p v-if="descripcion" class="text-xs text-isa-gray-500 dark:text-isa-gray-400 mt-0.5">
        {{ descripcion }}
      </p>
    </div>
    <EmptyState v-if="vacio" :mensaje="mensajeVacio" />
    <slot v-else />
  </div>
</template>

<script setup>
import EmptyState from './EmptyState.vue'

defineProps({
  titulo: { type: String, required: true },
  descripcion: { type: String, default: '' },
  vacio: { type: Boolean, default: false },
  mensajeVacio: {
    type: String,
    default: 'No hay datos suficientes para mostrar este gráfico con los filtros actuales.',
  },
})
</script>
