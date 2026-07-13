<template>
  <div class="bg-white dark:bg-isa-navy-light rounded-xl shadow-card p-4 flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <label for="umbral-vss" class="text-sm font-semibold text-isa-navy dark:text-isa-gray-100">
        Umbral mínimo de viviendas sin energía
      </label>
      <input
        id="umbral-vss-numero"
        type="number"
        :min="UMBRAL_MINIMO"
        :max="UMBRAL_MAXIMO"
        step="1"
        class="w-20 rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 bg-white dark:bg-isa-navy px-2 py-1 text-sm text-right text-isa-gray-800 dark:text-isa-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-isa-blue"
        :value="umbral"
        @change="manejarCambioNumero"
        aria-label="Valor exacto del umbral mínimo de viviendas sin energía"
      />
    </div>

    <input
      id="umbral-vss"
      type="range"
      :min="UMBRAL_MINIMO"
      :max="UMBRAL_MAXIMO"
      step="1"
      :value="umbral"
      class="w-full accent-isa-blue"
      @input="manejarCambioRango"
    />

    <div class="flex justify-between text-xs text-isa-gray-400 dark:text-isa-gray-500">
      <span>{{ UMBRAL_MINIMO }}</span>
      <span class="font-medium text-isa-blue dark:text-isa-blue-light">{{ umbral }} viviendas</span>
      <span>{{ UMBRAL_MAXIMO }}</span>
    </div>
  </div>
</template>

<script setup>
import { useDashboardStore } from '../../composables/useDashboardStore'
import { UMBRAL_MINIMO, UMBRAL_MAXIMO } from '../../config/projects'

const { umbral, actualizarUmbral } = useDashboardStore()

function limitar(valor) {
  const numero = Number(valor)
  if (Number.isNaN(numero)) return umbral.value
  return Math.min(UMBRAL_MAXIMO, Math.max(UMBRAL_MINIMO, Math.round(numero)))
}

function manejarCambioRango(evento) {
  actualizarUmbral(limitar(evento.target.value))
}

function manejarCambioNumero(evento) {
  actualizarUmbral(limitar(evento.target.value))
}
</script>
