<template>
  <div ref="raiz" class="relative">
    <label class="block text-xs font-medium text-isa-gray-600 dark:text-isa-gray-400 mb-1" for="buscador-vereda">
      Buscar vereda
    </label>
    <div class="relative">
      <svg
        class="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-isa-gray-400"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
      <input
        id="buscador-vereda"
        v-model="consulta"
        type="text"
        placeholder="Nombre de la vereda..."
        class="w-full rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 bg-white dark:bg-isa-navy-light pl-8 pr-3 py-2 text-sm text-isa-gray-800 dark:text-isa-gray-200 placeholder:text-isa-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-isa-blue"
        role="combobox"
        aria-expanded="abierto"
        aria-controls="lista-resultados-vereda"
        autocomplete="off"
        @focus="abierto = true"
      />
    </div>

    <ul
      v-if="abierto && consulta.trim().length > 0"
      id="lista-resultados-vereda"
      role="listbox"
      class="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 bg-white dark:bg-isa-navy-light shadow-card-hover"
    >
      <li v-if="!resultados.length" class="px-3 py-2.5 text-sm text-isa-gray-400">
        No se encontraron veredas con los filtros actuales.
      </li>
      <li v-for="feature in resultados" :key="feature.properties.VER_CCDGO">
        <button
          type="button"
          role="option"
          class="w-full text-left px-3 py-2 text-sm hover:bg-isa-gray-50 dark:hover:bg-isa-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-isa-blue"
          @click="elegir(feature)"
        >
          <span class="font-medium text-isa-gray-800 dark:text-isa-gray-200">
            {{ feature.properties.VEREDA }}
          </span>
          <span class="block text-xs text-isa-gray-500 dark:text-isa-gray-400">
            {{ feature.properties.MUNICIPIO }}, {{ feature.properties.DEPARTAMENTO }}
          </span>
        </button>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { normalizarTexto } from '../../utils/text'

const props = defineProps({
  features: { type: Array, required: true },
})
const emit = defineEmits(['seleccionar-vereda'])

const consulta = ref('')
const abierto = ref(false)
const raiz = ref(null)

const resultados = computed(() => {
  const texto = normalizarTexto(consulta.value.trim())
  if (!texto) return []
  return props.features
    .filter((f) => normalizarTexto(f.properties.VEREDA).includes(texto))
    .slice(0, 8)
})

function elegir(feature) {
  consulta.value = feature.properties.VEREDA
  abierto.value = false
  emit('seleccionar-vereda', feature.properties.VER_CCDGO)
}

function manejarClicFuera(evento) {
  if (raiz.value && !raiz.value.contains(evento.target)) {
    abierto.value = false
  }
}

onMounted(() => document.addEventListener('click', manejarClicFuera))
onBeforeUnmount(() => document.removeEventListener('click', manejarClicFuera))
</script>
