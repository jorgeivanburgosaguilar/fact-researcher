# Accesibilidad

Fecha: 2026-09-16. Alcance: importación, borrador local, workbench de revisión y exportación de Fact Researcher en escritorio.

## Superficie actual

La interfaz es desktop-first y presenta un workbench de dos paneles. La lista única de facts, a la izquierda, muestra ID, origen, tipo, confianza y una vista previa; el panel derecho muestra el detalle editable del fact seleccionado. Los facts textuales aparecen antes que los inferidos, sin perder su etiqueta de origen.

El encabezado ofrece el nombre del archivo, el selector **Sistema/Claro/Oscuro** y la exportación. La aplicación importa y valida JSON localmente, guarda el borrador en `localStorage` y exporta el JSON enriquecido sin solicitudes de red.

## Controles y estados

- La lista tiene semántica `listbox`/`option`, refleja la selección con `aria-selected` y mantiene visible el fact activo al elegirlo.
- El ID se expone como salida de solo lectura. Fact, tipo, confianza, verbatim, línea, columna y notas tienen etiquetas asociadas.
- Línea y columna pueden dejarse vacías para guardar `null`; las notas admiten contenido de investigación extenso.
- El estado se selecciona con texto explícito: **Pendiente** o **Verificado**. El color solo aporta refuerzo visual.
- Los controles muestran foco visible y el tema oscuro declara color y fondo para controles nativos.
- Los errores de importación usan `role="alert"`; los avisos de almacenamiento usan una región de estado anunciable.

## Verificación automatizada

La suite cubre la normalización de datos, posiciones nulas, compatibilidad de estados heredados, selección de un fact, actualización de notas, cambio de estado, persistencia, tema y exportación.

La aplicación no usa red, analytics, recursos remotos ni procesamiento de servidor.
