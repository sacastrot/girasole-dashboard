<template>
  <div class="bg-white dark:bg-isa-navy-light rounded-xl shadow-card p-4">
    <p class="text-sm text-isa-gray-700 dark:text-isa-gray-300">
      El puntaje de priorización solo se calcula para las veredas que superan el umbral mínimo
      vigente de viviendas sin servicio de energía.
    </p>

    <details class="mt-3 group">
      <summary
        class="cursor-pointer select-none text-sm font-medium text-isa-blue dark:text-isa-blue-light inline-flex items-center gap-1"
      >
        Ver metodología de cálculo
        <svg
          class="w-3.5 h-3.5 transition-transform group-open:rotate-180"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>

      <div class="mt-3 flex flex-col gap-3 text-sm text-isa-gray-600 dark:text-isa-gray-400">
        <div>
          <p class="font-medium text-isa-gray-800 dark:text-isa-gray-200">Variables utilizadas</p>
          <ul class="list-disc list-inside mt-1 space-y-0.5">
            <li>Viviendas sin energía.</li>
            <li>Presencia étnica: consejos comunitarios + resguardos indígenas.</li>
            <li>Accesibilidad vial: distancia promedio de las viviendas a las vías.</li>
          </ul>
        </div>

        <div>
          <p class="font-medium text-isa-gray-800 dark:text-isa-gray-200">Clasificación final</p>
          <ul class="list-disc list-inside mt-1 space-y-0.5">
            <li>Prioridad alta: de 80,0 a 100,0 puntos.</li>
            <li>Prioridad media: de 50,0 a menos de 80,0 puntos.</li>
            <li>Prioridad baja: menos de 50,0 puntos.</li>
          </ul>
        </div>
      </div>
    </details>
  </div>
</template>
