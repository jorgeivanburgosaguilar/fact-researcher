# Accesibilidad

Fecha: 2026-09-16. Alcance: importación, borrador local, lista de revisión y exportación de Fact Researcher en escritorio.

## Superficie actual

La interfaz es desktop-first y presenta una lista simple de facts. En cada fila, el ID y el texto original permanecen visibles a la izquierda. A la derecha aparecen la categoría (`type`), un campo de notas y el estado de revisión: **Sin verificar**, **Correcto** o **Incorrecto**. No hay filtros, progreso, ReviewTray, paneles expandibles, tabla/tarjetas móviles ni validación específica a 390 px.

El encabezado ofrece el nombre del archivo, el selector **Sistema/Claro/Oscuro** y la exportación. La aplicación importa y valida JSON localmente, guarda el borrador en `localStorage` y exporta el JSON enriquecido sin solicitudes de red.

## Controles y estados

- Los campos de estado y notas tienen etiquetas asociadas y son operables con teclado.
- Los controles muestran foco visible y los estados se expresan con texto; el color solo aporta refuerzo visual.
- Los errores de importación usan `role="alert"`; los avisos de almacenamiento usan una región de estado anunciable.
- La preferencia de tema se guarda de forma tolerante a fallos y se aplica mediante `html.dark`, incluyendo la preferencia del sistema.
- Los facts originales y sus campos de entrada se conservan; notas y estado se agregan en `human_review`.

## Verificación automatizada

La suite de componentes Vitest cubre nombres accesibles, importación, estados, notas, persistencia, restauración, tema y exportación. El flujo E2E de Playwright ejecuta Chromium headless y cubre carga de JSON en memoria, espera de hidratación, edición de nota, estado Incorrecto, restauración del borrador y descarga tras aceptar la confirmación de facts pendientes.

La aplicación no usa red, analytics, recursos remotos ni procesamiento de servidor.
