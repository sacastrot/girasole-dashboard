<template>
  <div ref="contenedor" class="w-full" :style="{ height }" role="img" :aria-label="ariaLabel"></div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEChart } from '../../composables/useEChart'
import { useTheme } from '../../composables/useTheme'
import { aplicarTemaEcharts } from '../../utils/chartTheme'

const props = defineProps({
  opciones: { type: Object, required: true },
  height: { type: String, default: '260px' },
  ariaLabel: { type: String, default: 'Gráfico' },
})

const contenedor = ref(null)
const { tema } = useTheme()

const opcionesConTema = computed(() => aplicarTemaEcharts(props.opciones, tema.value === 'oscuro'))

useEChart(contenedor, opcionesConTema)
</script>
