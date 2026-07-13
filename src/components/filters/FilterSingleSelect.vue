<template>
  <label class="flex items-center gap-1.5 text-xs">
    <span class="sr-only">{{ etiqueta }}</span>
    <select
      class="rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 bg-white dark:bg-isa-navy-light px-2.5 py-1.5 text-xs font-medium text-isa-gray-700 dark:text-isa-gray-300 hover:border-isa-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-isa-blue"
      :value="modelValue"
      :aria-label="etiqueta"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="todos">{{ etiqueta }}: Todos</option>
      <option v-for="opcion in opciones" :key="opcion.valor" :value="opcion.valor">
        {{ etiqueta }}: {{ opcion.texto }}
      </option>
    </select>
  </label>
</template>

<script setup>
defineProps({
  etiqueta: { type: String, required: true },
  // opciones: [{ valor: 'SI', texto: 'Sí' }, ...]
  opciones: { type: Array, default: () => [] },
  modelValue: { type: String, default: 'todos' },
})
defineEmits(['update:modelValue'])
</script>
