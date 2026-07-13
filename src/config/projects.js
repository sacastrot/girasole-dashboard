/**
 * Configuración estática de los cuatro proyectos futuros de ISA.
 * El número real de veredas se obtiene en tiempo de ejecución desde
 * public/data/manifest.json; aquí solo se define la identidad de cada
 * proyecto y su archivo de datos asociado.
 */
export const PROYECTOS = [
  {
    id: 'nordeste',
    nombre: 'Interconexión Nordeste',
    archivoDatos: 'nordeste.geojson',
    descripcion: 'Área de influencia del proyecto de interconexión en el Nordeste de Antioquia.',
    acento: 'girasole-orange',
  },
  {
    id: 'aguaclara',
    nombre: 'Subestación Aguaclara',
    archivoDatos: 'aguaclara.geojson',
    descripcion: 'Área de influencia de la nueva subestación Aguaclara.',
    acento: 'isa-blue',
  },
  {
    id: 'oriental',
    nombre: 'Interconexión Antioquia Oriental',
    archivoDatos: 'oriental.geojson',
    descripcion: 'Área de influencia del proyecto de interconexión en el Oriente antioqueño.',
    acento: 'girasole-yellow',
  },
  {
    id: 'amanecer',
    nombre: 'Subestación Amanecer',
    archivoDatos: 'amanecer.geojson',
    descripcion: 'Área de influencia de la nueva subestación Amanecer.',
    acento: 'isa-navy',
  },
]

export const UMBRAL_INICIAL = 25
export const UMBRAL_MINIMO = 0
export const UMBRAL_MAXIMO = 500

export function obtenerProyectoPorId(id) {
  return PROYECTOS.find((p) => p.id === id) || null
}
