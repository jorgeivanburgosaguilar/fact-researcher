# Fact Researcher

Fact Researcher es una herramienta privada y local para revisar facts desde un JSON y descargar un resultado enriquecido.

## Producto

La experiencia es una lista sencilla desktop-first. Cada fila muestra a la izquierda el ID y el fact original; a la derecha muestra su categoría, un espacio para notas y el estado **Sin verificar**, **Correcto** o **Incorrecto**. No incluye filtros, búsqueda, progreso, contadores, paneles, correcciones propuestas ni diseño móvil.

La importación valida estrictamente el esquema de facts. Las notas y estados se guardan en un borrador versionado de `localStorage`, y la exportación conserva todos los campos originales (`confidence`, `verbatim`) junto con `human_review`. Si el almacenamiento falla, se avisa sin bloquear la revisión o descarga.

## Restricciones

La aplicación es SvelteKit estática, client-side only y sin solicitudes de red, analytics, assets remotos ni procesamiento de servidor. El tema Sistema/Claro/Oscuro es opcional y se aplica con `html.dark`.

## Accesibilidad

Todos los controles tienen etiquetas, foco visible y estados expresados con texto además de color. Los errores y avisos usan regiones anunciables.
