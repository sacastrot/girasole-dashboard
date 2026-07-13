<template>
  <div ref="raiz" class="relative">
    <button
      type="button"
      class="flex items-center gap-1.5 rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 bg-white dark:bg-isa-navy-light px-3 py-1.5 text-xs font-medium text-isa-gray-700 dark:text-isa-gray-300 hover:border-isa-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-isa-blue whitespace-nowrap"
      :aria-expanded="abierto"
      :aria-label="`Filtro ${etiqueta}`"
      @click="abierto = !abierto"
    >
      {{ etiqueta }}
      <span
        v-if="modelValue.length"
        class="ml-0.5 inline-flex items-center justify-center rounded-full bg-isa-blue text-white text-[10px] w-4 h-4"
      >
        {{ modelValue.length }}
      </span>
      <svg class="w-3.5 h-3.5 text-isa-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
      </svg>
    </button>

    <div
      v-if="abierto"
      class="absolute z-20 mt-1 w-60 max-h-72 overflow-auto rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 bg-white dark:bg-isa-navy-light shadow-card-hover p-2"
      role="group"
      :aria-label="`Opciones de ${etiqueta}`"
    >
      <button
        v-if="modelValue.length"
        type="button"
        class="w-full text-left text-xs text-isa-blue hover:underline px-1 py-1 mb-1"
        @click="$emit('update:modelValue', [])"
      >
        Limpiar selección
      </button>

      <label
        v-for="opcion in opciones"
        :key="opcion"
        class="flex items-center gap-2 py-1 px-1 rounded text-sm text-isa-gray-700 dark:text-isa-gray-300 hover:bg-isa-gray-50 dark:hover:bg-isa-navy cursor-pointer"
      >
        <input
          type="checkbox"
          class="rounded border-isa-gray-300 text-isa-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-isa-blue"
          :checked="modelValue.includes(opcion)"
          @change="alternar(opcion)"
        />
        <span class="truncate">{{ opcion }}</span>
      </label>

      <p v-if="!opciones.length" class="text-xs text-isa-gray-400 dark:text-isa-gray-500 py-2 px-1">
        Sin opciones disponibles
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  etiqueta: { type: String, required: true },
  opciones: { type: Array, default: () => [] },
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const abierto = ref(false)
const raiz = ref(null)

function alternar(opcion) {
  const actual = props.modelValue
  const nuevo = actual.includes(opcion)
    ? actual.filter((v) => v !== opcion)
    : [...actual, opcion]
  emit('update:modelValue', nuevo)
}

function manejarClicFuera(evento) {
  if (raiz.value && !raiz.value.contains(evento.target)) {
    abierto.value = false
  }
}

onMounted(() => document.addEventListener('click', manejarClicFuera))
onBeforeUnmount(() => document.removeEventListener('click', manejarClicFuera))
</script>
