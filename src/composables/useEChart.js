import { onMounted, onBeforeUnmount, watch, shallowRef } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
  CanvasRenderer,
])

/**
 * Gestiona la creación, actualización, redimensionamiento y destrucción de
 * una instancia de ECharts anclada a un elemento del DOM.
 *
 * @param {import('vue').Ref<HTMLElement|null>} contenedorRef
 * @param {import('vue').ComputedRef<object>} opcionesRef - Opción de ECharts, ya tematizada.
 */
export function useEChart(contenedorRef, opcionesRef) {
  const instancia = shallowRef(null)
  let observador = null

  function renderizar() {
    if (!instancia.value || !opcionesRef.value) return
    instancia.value.setOption(opcionesRef.value, true)
  }

  onMounted(() => {
    if (!contenedorRef.value) return
    instancia.value = echarts.init(contenedorRef.value)
    renderizar()

    observador = new ResizeObserver(() => {
      instancia.value?.resize()
    })
    observador.observe(contenedorRef.value)
  })

  watch(opcionesRef, renderizar)

  onBeforeUnmount(() => {
    observador?.disconnect()
    instancia.value?.dispose()
    instancia.value = null
  })

  return { instancia }
}
