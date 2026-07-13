<template>
  <div class="min-h-screen bg-isa-gray-50 dark:bg-isa-navy-dark text-isa-gray-800 dark:text-isa-gray-200">
    <AppHeader />
    <HomeView v-if="!proyectoActual" />
    <DashboardView v-else />
  </div>
</template>

<script setup>
import AppHeader from './components/common/AppHeader.vue'
import HomeView from './views/HomeView.vue'
import DashboardView from './views/DashboardView.vue'
import { useDashboardStore } from './composables/useDashboardStore'

const { proyectoActual } = useDashboardStore()
</script>
