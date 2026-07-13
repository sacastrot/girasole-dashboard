<template>
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
    <div class="lg:col-span-2 flex flex-col gap-3">
      <div>
        <VillageSearch class="absolute" :features="features" @seleccionar-vereda="seleccionarVereda"/>
      </div>
      <div class="h-[480px] lg:h-[620px]">
        <VillageMap
          :features="features"
          :vereda-seleccionada-id="veredaSeleccionadaId"
          @seleccionar-vereda="seleccionarVereda"
        />
      </div>
    </div>

    <div class="bg-white dark:bg-isa-navy-light rounded-xl shadow-card p-4 lg:h-[620px] lg:overflow-hidden">
      <VillageDetails :vereda="veredaSeleccionada" />
    </div>
  </div>
</template>

<script setup>
import VillageSearch from './VillageSearch.vue'
import VillageMap from '../map/VillageMap.vue'
import VillageDetails from './VillageDetails.vue'
import { useDashboardStore } from '../../composables/useDashboardStore'

defineProps({
  features: { type: Array, required: true },
})

const { veredaSeleccionadaId, veredaSeleccionada, seleccionarVereda } = useDashboardStore()
</script>
