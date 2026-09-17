# Fact Researcher

Fact Researcher es una herramienta privada y local para revisar facts desde un JSON y descargar un resultado enriquecido.

## Producto

La experiencia es un workbench desktop-first: una lista única y seleccionable de facts a la izquierda y el detalle editable del fact activo a la derecha. Cada fila conserva su ID, texto, tipo, confianza y una etiqueta que indica si es textual o inferido. El detalle permite editar fact, tipo, confianza, verbatim y posición; el ID es de solo lectura. Las posiciones de línea y columna pueden ser nulas.

Las notas admiten apuntes de investigación extensos, incluidos enlaces, y se guardan junto a un estado de verificación de dos opciones: **Pendiente** o **Verificado**. La importación normaliza el antiguo estado `not_verified` a pendiente.

La importación valida estrictamente el esquema de facts. Las notas y estados se guardan en un borrador versionado de `localStorage`, y la exportación conserva todos los campos originales junto con los datos de revisión. Si el almacenamiento falla, se avisa sin bloquear la revisión o descarga.

## Restricciones

La aplicación es SvelteKit estática, client-side only y sin solicitudes de red, analytics, assets remotos ni procesamiento de servidor. El tema Sistema/Claro/Oscuro es opcional y se aplica con `html.dark`.

## Accesibilidad

La lista usa selección accesible y mantiene visible el fact activo. Todos los controles tienen etiquetas, foco visible y estados expresados con texto además de color. Los errores y avisos usan regiones anunciables.
