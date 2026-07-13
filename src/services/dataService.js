/**
 * Servicio de acceso a los datos estáticos generados por el preprocesamiento
 * de Python (public/data/manifest.json y public/data/<proyecto>.geojson).
 *
 * Implementa caché en memoria para evitar volver a descargar un proyecto ya
 * consultado durante la misma sesión.
 */

const cacheGeoJSON = new Map()
let cacheManifest = null

function rutaBase() {
  return import.meta.env.BASE_URL
}

export async function obtenerManifest() {
  if (cacheManifest) return cacheManifest

  const respuesta = await fetch(`${rutaBase()}data/manifest.json`)
  if (!respuesta.ok) {
    throw new Error(
      `No fue posible cargar el archivo de manifiesto (manifest.json). Código HTTP ${respuesta.status}.`
    )
  }
  cacheManifest = await respuesta.json()
  return cacheManifest
}

export async function obtenerDatosProyecto(archivoGeoJSON) {
  if (cacheGeoJSON.has(archivoGeoJSON)) {
    return cacheGeoJSON.get(archivoGeoJSON)
  }

  const respuesta = await fetch(`${rutaBase()}data/${archivoGeoJSON}`)
  if (!respuesta.ok) {
    throw new Error(
      `No fue posible cargar el archivo de datos "${archivoGeoJSON}". Código HTTP ${respuesta.status}.`
    )
  }

  let datos
  try {
    datos = await respuesta.json()
  } catch {
    throw new Error(`El archivo "${archivoGeoJSON}" no contiene un GeoJSON válido.`)
  }

  if (!datos || datos.type !== 'FeatureCollection' || !Array.isArray(datos.features)) {
    throw new Error(`El archivo "${archivoGeoJSON}" no tiene una estructura GeoJSON válida.`)
  }

  cacheGeoJSON.set(archivoGeoJSON, datos.features)
  return datos.features
}
