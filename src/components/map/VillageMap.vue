<template>
  <div
    class="relative w-full h-full min-h-[420px] rounded-xl overflow-visible border border-isa-gray-200 dark:border-isa-gray-800 z-10"
  >
    <div ref="contenedorMapa" class="w-full h-full"></div>
    <MapLegend class="absolute bottom-3 left-3 z-[1000]" :items="itemsLeyenda" />
    <button
      type="button"
      class="absolute top-3 right-3 z-[1000] inline-flex items-center gap-1.5 rounded-lg bg-white/95 dark:bg-isa-navy-light/95 backdrop-blur border border-isa-gray-200 dark:border-isa-gray-800 shadow-card px-2.5 py-1.5 text-xs font-medium text-isa-gray-700 dark:text-isa-gray-300 hover:border-isa-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-isa-blue"
      aria-label="Ajustar vista a las veredas visibles"
      @click="ajustarVista"
    >
      <svg
        class="w-3.5 h-3.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15m11.25 5.25v-4.5m0 4.5h-4.5m4.5 0L15 15"
        />
      </svg>
      Ajustar vista
    </button>

    <div
      v-if="!features.length"
      class="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-isa-navy/80"
    >
      <EmptyState
        mensaje="Ninguna vereda visible cumple los filtros globales actuales."
      />
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import MapLegend from "./MapLegend.vue";
import EmptyState from "../common/EmptyState.vue";
import { useTheme } from "../../composables/useTheme";
import {
  calcularCuantiles,
  asignarClase,
  colorDeClase,
} from "../../utils/quantiles";
import { formatEntero } from "../../utils/formatters";
import { escaparHtml } from "../../utils/text";

const props = defineProps({
  features: { type: Array, required: true },
  veredaSeleccionadaId: { type: String, default: null },
});
const emit = defineEmits(["seleccionar-vereda"]);

const contenedorMapa = ref(null);
const { tema } = useTheme();

let mapa = null;
let capaGeoJSON = null;
let capaBase = null;
let observadorTamaño = null;

const CENTRO_INICIAL = [7.0, -75.0]; // Nordeste de Antioquia, vista de referencia
const ZOOM_INICIAL = 9;

const valoresVss = computed(() =>
  props.features.map((f) => f.properties.VSS_GIRASOLE),
);
const cuantiles = computed(() => calcularCuantiles(valoresVss.value, 5));

const itemsLeyenda = computed(() => {
  const { cortes, numClases } = cuantiles.value;
  if (numClases === 0) return [];

  const conteos = new Array(Math.max(numClases, 1)).fill(0);
  valoresVss.value.forEach((v) => {
    const clase = asignarClase(v, cortes);
    conteos[clase] = (conteos[clase] || 0) + 1;
  });

  return conteos.map((conteo, i) => {
    const inferior = Math.round(cortes[i]);
    const superior = Math.round(cortes[i + 1] ?? cortes[i]);
    const etiqueta =
      numClases === 1
        ? `${inferior} – ${superior}`
        : `${inferior} – ${superior}`;
    return { color: colorDeClase(i, Math.max(numClases, 1)), etiqueta, conteo };
  });
});

function colorPorVss(valor) {
  const { cortes, numClases } = cuantiles.value;
  if (numClases === 0) return "#94A0AF";
  const clase = asignarClase(valor, cortes);
  return colorDeClase(clase, numClases);
}

function estiloFeature(feature) {
  const seleccionada =
    feature.properties.VER_CCDGO === props.veredaSeleccionadaId;
  return {
    fillColor: colorPorVss(feature.properties.VSS_GIRASOLE),
    fillOpacity: seleccionada ? 0.85 : 0.65,
    color: seleccionada ? "#0B2545" : "#FFFFFF",
    weight: seleccionada ? 3 : 1,
    dashArray: null,
  };
}

function estadoDistribucionTexto(valor) {
  if (valor === "SI") return "Con distribución";
  if (valor === "NO") return "Sin distribución";
  return "No disponible";
}

function contenidoPopup(p) {
  return `
    <div style="font-family: Inter, system-ui, sans-serif; font-size: 12.5px; line-height: 1.5;">
      <strong style="font-size: 13.5px;">${escaparHtml(p.VEREDA)}</strong><br/>
      ${escaparHtml(p.MUNICIPIO)}, ${escaparHtml(p.DEPARTAMENTO)}<br/>
      Viviendas sin energía: <strong>${formatEntero(p.VSS_GIRASOLE)}</strong><br/>
      Nivel de seguridad: ${escaparHtml(p.NIVEL_SEGURIDAD)}<br/>
      Distribución de energía: ${escaparHtml(estadoDistribucionTexto(p.DISTRIBUCION_ENERGIA_PRESENCIA))}
    </div>
  `;
}

function alEstiloFeature(feature, capa) {
  capa.on({
    click: () => emit("seleccionar-vereda", feature.properties.VER_CCDGO),
    mouseover: (e) => {
      e.target.setStyle({ weight: 3, fillOpacity: 0.85 });
    },
    mouseout: (e) => {
      if (feature.properties.VER_CCDGO !== props.veredaSeleccionadaId) {
        e.target.setStyle(estiloFeature(feature));
      }
    },
  });
  capa.bindPopup(contenidoPopup(feature.properties));
}

function construirColeccion(features) {
  return { type: "FeatureCollection", features };
}

function redibujarCapa() {
  if (!capaGeoJSON) return;
  capaGeoJSON.clearLayers();
  if (props.features.length) {
    capaGeoJSON.addData(construirColeccion(props.features));
  }
}

function ajustarVista() {
  if (!mapa || !capaGeoJSON) return;
  const limites = capaGeoJSON.getBounds();
  if (limites.isValid()) {
    mapa.fitBounds(limites, { padding: [24, 24] });
  }
}

onMounted(() => {
  mapa = L.map(contenedorMapa.value, {
    center: CENTRO_INICIAL,
    zoom: ZOOM_INICIAL,
    zoomControl: true,
  });

  capaBase = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  }).addTo(mapa);

  capaGeoJSON = L.geoJSON(construirColeccion(props.features), {
    style: estiloFeature,
    onEachFeature: alEstiloFeature,
  }).addTo(mapa);

  nextTick(() => {
    mapa.invalidateSize();
    ajustarVista();
  });

  observadorTamaño = new ResizeObserver(() => mapa?.invalidateSize());
  observadorTamaño.observe(contenedorMapa.value);
});

watch(
  () => props.features,
  () => redibujarCapa(),
);

watch(
  () => props.veredaSeleccionadaId,
  () => redibujarCapa(),
);

watch(tema, () => redibujarCapa());

onBeforeUnmount(() => {
  observadorTamaño?.disconnect();
  capaGeoJSON?.clearLayers();
  mapa?.remove();
  mapa = null;
  capaGeoJSON = null;
  capaBase = null;
});
</script>
