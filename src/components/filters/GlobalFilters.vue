<template>
  <div class="bg-isa-gray-50 dark:bg-isa-navy-dark border-b border-isa-gray-200 dark:border-isa-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center gap-2 overflow">
      <FilterMultiSelect
        etiqueta="Departamento"
        :opciones="departamentosDisponibles"
        :model-value="filtros.departamentos"
        @update:model-value="(v) => actualizarFiltro('departamentos', v)"
      />
      <FilterMultiSelect
        etiqueta="Municipio"
        :opciones="municipiosDisponibles"
        :model-value="filtros.municipios"
        @update:model-value="(v) => actualizarFiltro('municipios', v)"
      />
      <FilterSingleSelect
        etiqueta="PDET"
        :opciones="opcionesSiNo"
        :model-value="filtros.pdet"
        @update:model-value="(v) => actualizarFiltro('pdet', v)"
      />
      <FilterSingleSelect
        etiqueta="ZOMAC"
        :opciones="opcionesSiNo"
        :model-value="filtros.zomac"
        @update:model-value="(v) => actualizarFiltro('zomac', v)"
      />
      <FilterSingleSelect
        etiqueta="ISA AID"
        :opciones="opcionesSiNo"
        :model-value="filtros.isaAid"
        @update:model-value="(v) => actualizarFiltro('isaAid', v)"
      />
      <FilterMultiSelect
        etiqueta="Nivel de seguridad"
        :opciones="nivelesSeguridadDisponibles"
        :model-value="filtros.nivelesSeguridad"
        @update:model-value="(v) => actualizarFiltro('nivelesSeguridad', v)"
      />
      <FilterSingleSelect
        etiqueta="Áreas protegidas"
        :opciones="opcionesSiNo"
        :model-value="filtros.areasProtegidas"
        @update:model-value="(v) => actualizarFiltro('areasProtegidas', v)"
      />
      <FilterSingleSelect
        etiqueta="Consejos comunitarios"
        :opciones="opcionesSiNo"
        :model-value="filtros.consejos"
        @update:model-value="(v) => actualizarFiltro('consejos', v)"
      />
      <FilterSingleSelect
        etiqueta="Resguardos indígenas"
        :opciones="opcionesSiNo"
        :model-value="filtros.resguardos"
        @update:model-value="(v) => actualizarFiltro('resguardos', v)"
      />
      <FilterSingleSelect
        etiqueta="Cultivos ilícitos"
        :opciones="opcionesSiNoDisponible"
        :model-value="filtros.cultivos"
        @update:model-value="(v) => actualizarFiltro('cultivos', v)"
      />
      <FilterSingleSelect
        etiqueta="Distribución de energía"
        :opciones="opcionesSiNoDisponible"
        :model-value="filtros.distribucion"
        @update:model-value="(v) => actualizarFiltro('distribucion', v)"
      />

      <button
        type="button"
        class="ml-auto shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-isa-gray-200 dark:border-isa-gray-800 bg-white dark:bg-isa-navy-light px-3 py-1.5 text-xs font-medium text-isa-gray-700 dark:text-isa-gray-300 hover:border-girasole-orange hover:text-girasole-orange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-isa-blue"
        @click="limpiarFiltros"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
        Limpiar filtros
      </button>
    </div>
  </div>
</template>

<script setup>
import FilterMultiSelect from './FilterMultiSelect.vue'
import FilterSingleSelect from './FilterSingleSelect.vue'
import { useDashboardStore } from '../../composables/useDashboardStore'

const {
  filtros,
  actualizarFiltro,
  limpiarFiltros,
  departamentosDisponibles,
  municipiosDisponibles,
  nivelesSeguridadDisponibles,
} = useDashboardStore()

const opcionesSiNo = [
  { valor: 'SI', texto: 'Sí' },
  { valor: 'NO', texto: 'No' },
]

const opcionesSiNoDisponible = [
  { valor: 'SI', texto: 'Sí' },
  { valor: 'NO', texto: 'No' },
  { valor: 'NO_DISPONIBLE', texto: 'No disponible' },
]
</script>
