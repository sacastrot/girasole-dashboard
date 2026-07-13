# Dashboard plan de expansión ISA

Dashboard interno de la **Dirección de Proyectos de ISA Interconexión Eléctrica S.A.
Colombia** para consultar el área de influencia de cuatro proyectos futuros de
transmisión de energía, analizar las condiciones territoriales, energéticas,
sociales y de accesibilidad de las veredas involucradas, y calcular un puntaje
de priorización de electrificación rural con apoyo de **ISA Impact**.

Uso interno. Sitio estático, sin backend ni base de datos, publicable en
GitHub Pages.

---

## 1. Descripción del proyecto

El dashboard permite:

- Consultar el área de influencia de los proyectos **Interconexión Nordeste**,
  **Subestación Aguaclara**, **Interconexión Antioquia Oriental** y
  **Subestación Amanecer**.
- Analizar características territoriales, energéticas, sociales y de
  accesibilidad de las veredas de cada proyecto.
- Visualizar las veredas en un geovisor interactivo (Leaflet + OpenStreetMap).
- Consultar la ficha individual de cada vereda.
- Identificar veredas en las que **ISA Impact** podría apoyar procesos de
  electrificación rural y mitigación de riesgos.
- Calcular un **puntaje de priorización de electrificación rural** a partir de
  viviendas sin energía, presencia étnica y accesibilidad vial.
- Filtrar interactiva y globalmente la información de cada proyecto.

Los datos de origen (CSV con geometrías WKT) se procesan **una sola vez, en el
equipo de desarrollo**, con un script de Python. El resultado son archivos
GeoJSON y un manifiesto JSON estáticos que el sitio publicado consume
directamente, sin backend ni servicios externos de pago.

## 2. Tecnologías utilizadas

**Front-end**

- Vue.js 3 (Composition API) + Vite
- Tailwind CSS (modo oscuro por clase)
- Leaflet (geovisor) + OpenStreetMap
- ECharts (gráficos, con importación parcial para reducir el tamaño del bundle)
- TanStack Table para Vue (tabla de priorización)

**Preprocesamiento (solo en desarrollo)**

- Python 3.11+
- pandas, GeoPandas, Shapely, PyProj, NumPy

**Despliegue**

- GitHub Pages (sitio estático)
- GitHub Actions (despliegue automático)

## 3. Requisitos previos

- Node.js 20 o superior y npm.
- Python 3.11 o superior con `pip`.
- Los cuatro archivos CSV reales de origen (no incluidos en este repositorio).
- Git y una cuenta de GitHub con permisos sobre el repositorio de destino.

## 4. Estructura de carpetas

```text
dashboard-plan-expansion-isa/
├── .github/workflows/deploy-pages.yml   Workflow de despliegue en GitHub Pages
├── data/raw/                            Aquí se ubican los 4 CSV reales (no versionados)
├── scripts/
│   ├── config.py                        Parámetros del preprocesamiento
│   └── preprocess_data.py               Script de preprocesamiento geoespacial
├── public/
│   ├── assets/                          Logo de Girasole (assets/logo-girasole.png)
│   └── data/                            GeoJSON + manifest.json generados (no versionados)
├── src/
│   ├── components/
│   │   ├── common/                      Encabezado, pestañas, tarjetas, estados
│   │   ├── filters/                     Filtros globales
│   │   ├── charts/                      Envoltorio base de ECharts
│   │   ├── map/                         Geovisor y leyenda
│   │   ├── home/                        Selección de proyecto
│   │   ├── summary/                     Resumen General
│   │   ├── village/                     Análisis Veredal (mapa, buscador, ficha)
│   │   └── prioritization/              ISA Impact (umbral, metodología, tabla)
│   ├── composables/                     Estado centralizado y utilidades de Vue
│   ├── config/                          Configuración estática de proyectos
│   ├── services/                        Acceso a datos con caché en memoria
│   ├── utils/                           Funciones puras: formato, filtros, puntaje, gráficos
│   ├── views/                           HomeView y DashboardView
│   ├── App.vue, main.js, style.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
├── requirements.txt
└── README.md
```

## 5. Ubicación esperada de los cuatro CSV

Copie los cuatro archivos reales dentro de `data/raw/`, con estos nombres
exactos:

```text
data/raw/100726_REPORT_VEREDAS_INFLUENCIA_ENERGY_NEW_LT_NORDESTE.csv
data/raw/100726_REPORT_VEREDAS_INFLUENCIA_ENERGY_NEW_LT_AGUACLARA.csv
data/raw/100726_REPORT_VEREDAS_INFLUENCIA_ENERGY_NEW_LT_ORIENTAL.csv
data/raw/100726_REPORT_VEREDAS_INFLUENCIA_ENERGY_NEW_LT_AMANECER.csv
```

Estos archivos **no se versionan** (ver `.gitignore`) porque contienen
información interna. `data/raw/.gitkeep` mantiene la carpeta en el
repositorio.

## 6. Creación de entorno virtual de Python

**Windows (PowerShell)**

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

## 7. Instalación de dependencias Python

```powershell
pip install -r requirements.txt
```

(mismo comando en macOS/Linux, con el entorno virtual activado)

## 8. Ejecución del preprocesamiento

Con los cuatro CSV ya ubicados en `data/raw/`:

```powershell
python scripts/preprocess_data.py
```

```bash
python3 scripts/preprocess_data.py
```

El script valida exhaustivamente los datos (ver sección 17) y, si todo es
correcto, genera los archivos estáticos en `public/data/`. Si encuentra un
problema, se detiene sin generar archivos parciales e imprime el archivo, la
fila, el código de vereda y la columna afectada.

## 9. Archivos generados

```text
public/data/manifest.json     Metadatos de los 4 proyectos (nombre, veredas, CRS, versión)
public/data/nordeste.geojson
public/data/aguaclara.geojson
public/data/oriental.geojson
public/data/amanecer.geojson
```

Estos archivos tampoco se versionan por defecto; se regeneran ejecutando el
script de preprocesamiento. El dashboard solo carga el GeoJSON del proyecto
que el usuario selecciona (carga bajo demanda, con caché en memoria durante
la sesión).

## 10. Instalación de dependencias Node

```powershell
npm install
```

## 11. Ejecución local

```powershell
npm run dev
```

Abra `http://localhost:5173`. En desarrollo local no es necesario configurar
`VITE_BASE_PATH`.

## 12. Compilación

```powershell
npm run build
```

Genera el sitio estático completo en `dist/`. Puede previsualizarlo con:

```powershell
npm run preview
```

## 13. Configuración de VITE_BASE_PATH

Antes de compilar para GitHub Pages, copie `.env.example` como `.env` y
defina el nombre exacto del repositorio:

```powershell
Copy-Item .env.example .env
```

```bash
cp .env.example .env
```

Edite `.env`:

```text
VITE_BASE_PATH=/nombre-del-repositorio/
```

Todas las rutas a datos, assets y el logo respetan automáticamente esta base
mediante `import.meta.env.BASE_URL`.

## 14. Despliegue en GitHub Pages (manual)

1. Configure `VITE_BASE_PATH` como se indica en la sección 13.
2. Ejecute `npm run build`.
3. Publique el contenido de `dist/` en la rama o mecanismo que su
   organización use para GitHub Pages (por ejemplo, con `gh-pages` o subiendo
   `dist/` a la rama configurada en Settings → Pages).
4. En GitHub, active Pages con origen "GitHub Actions" o la rama
   correspondiente, según el método elegido.

## 15. Despliegue mediante GitHub Actions

El workflow `.github/workflows/deploy-pages.yml` automatiza el despliegue:

1. Se ejecuta en cada `push` a `main` (o manualmente desde la pestaña
   Actions).
2. Instala dependencias, compila el sitio con
   `VITE_BASE_PATH=/<nombre-del-repositorio>/` (tomado automáticamente del
   nombre del repositorio) y publica `dist/` con `actions/deploy-pages`.
3. Requiere que, en Settings → Pages, la fuente esté configurada como
   **GitHub Actions**.

Los archivos generados por el preprocesamiento de Python (`public/data/*`)
deben existir en el repositorio (o generarse en un paso previo) para que el
workflow los incluya en la compilación; este proyecto no ejecuta Python en
GitHub Actions.

## 16. Ubicación del logo

Copie el logo real con este nombre exacto:

```text
public/assets/logo-girasole.png
```

Si el archivo no existe, el encabezado muestra el texto alternativo
"Girasole" sin romper el diseño ni mostrar íconos de imagen rota. Vea también
`public/assets/README.md`.

## 17. Reglas de validación

El script `scripts/preprocess_data.py` valida, entre otras reglas:

- `VER_CCDGO` único dentro de cada archivo y entre los cuatro proyectos.
- `PDET`, `ZOMAC`, `ISA_AID` únicamente `SI` o `NO`.
- `NIVEL_SEGURIDAD` únicamente `MUY BAJO`, `BAJO`, `MEDIO` o `ALTO`.
- `VSS_GIRASOLE` entero, no negativo, no vacío.
- Porcentajes entre 0 y 100; `-1` o vacío significa "No disponible".
- Distancias y longitudes no negativas; `-1` o vacío significa "No
  disponible"; `DISTANCIA_MINIMA ≤ DISTANCIA_PROMEDIO ≤ DISTANCIA_MAXIMA`.
- `RUNAP_CATEGORIA`, `RUNAP_NOMBRE`, `CONSEJO_COMUNITARIO`,
  `RESGUARDO_INDIGENA`: deben ser `0` o un diccionario Python interpretado
  con `ast.literal_eval` (nunca `eval`); no admiten vacíos, nulos ni `-1`.
- Geometrías: se repara con `make_valid` cuando son inválidas, se conservan
  solo componentes poligonales, se simplifican en EPSG:9377 y se transforman
  a EPSG:4326, validando en cada paso.

Cualquier incumplimiento detiene el proceso e imprime el archivo, la fila, el
`VER_CCDGO`, la `VEREDA`, la columna y el valor encontrado.

## 18. Parámetro de simplificación

La tolerancia de simplificación geométrica se define en
`scripts/config.py`:

```python
SIMPLIFY_TOLERANCE_METERS = 20
```

Auméntela para geometrías más livianas (menor detalle) o redúzcala para
mayor fidelidad (archivos más pesados). Se aplica en EPSG:9377 (unidades
métricas) antes de transformar a EPSG:4326, con `preserve_topology=True`.

## 19. Umbral de ISA Impact

En la pestaña **ISA Impact**, el umbral mínimo de viviendas sin energía:

- Inicia en **25**, con rango de **0 a 500** y paso de 1.
- Una vereda es elegible cuando `VSS_GIRASOLE > umbral`.
- El puntaje de priorización se normaliza usando **todas** las veredas
  elegibles del proyecto, **antes** de aplicar los filtros globales; los
  filtros solo controlan qué se muestra, no recalculan el puntaje.
- El valor inicial puede ajustarse en `src/config/projects.js`
  (`UMBRAL_INICIAL`, `UMBRAL_MINIMO`, `UMBRAL_MAXIMO`).

## 20. Solución de problemas frecuentes

**"No se encontró el archivo CSV esperado"**
Verifique que los cuatro CSV estén en `data/raw/` con el nombre exacto
indicado en la sección 5.

**El script se detiene con un error de validación**
Lea el mensaje completo: indica el archivo, la fila, el `VER_CCDGO`, la
`VEREDA`, la columna y el valor problemático. Corrija el dato en el CSV de
origen y vuelva a ejecutar el script.

**El sitio publicado muestra un error al cargar los datos**
Confirme que `public/data/manifest.json` y los cuatro `.geojson` existen y
que `VITE_BASE_PATH` coincide exactamente con el nombre del repositorio
(incluyendo barras al inicio y al final).

**El logo no aparece**
Confirme que el archivo está en `public/assets/logo-girasole.png`. Si no
existe, el texto alternativo "Girasole" es el comportamiento esperado, no un
error.

**El mapa no muestra el mosaico base de OpenStreetMap**
Verifique la conexión a internet del navegador y que no exista un proxy o
firewall corporativo bloqueando `tile.openstreetmap.org`. Los polígonos de
las veredas se renderizan igualmente aunque el mosaico base no cargue.

**Errores de permisos en PowerShell al activar el entorno virtual**
Ejecute PowerShell como administrador y, si es necesario,
`Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` antes de activar el
entorno virtual.
