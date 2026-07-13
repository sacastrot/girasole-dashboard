# Carpeta de assets públicos

Ubique aquí el logo de Girasole con exactamente este nombre de archivo:

```
public/assets/logo-girasole.png
```

En la aplicación compilada, la ruta se resuelve como:

```
{BASE_URL}assets/logo-girasole.png
```

donde `BASE_URL` corresponde a `import.meta.env.BASE_URL`, que a su vez
depende de la variable `VITE_BASE_PATH` configurada al compilar.

Si el archivo no existe o no carga, el encabezado muestra el texto
alternativo `Girasole` y el diseño permanece estable, sin íconos de imagen
rota.

Este archivo README.md no afecta la compilación; es únicamente una guía
para ubicar el logo real, el cual no se incluye en este repositorio.
