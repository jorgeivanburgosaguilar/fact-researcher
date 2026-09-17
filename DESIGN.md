# Design

## Dirección

Fact Researcher es un workbench de verificación desktop-first. La lista de facts funciona como índice de investigación; el panel de detalle mantiene el contexto y concentra la edición de un registro a la vez.

## Layout

La pantalla conserva un encabezado mínimo con nombre de archivo, selector de tema y exportación. Debajo, dos paneles comparten el espacio: a la izquierda una lista vertical y desplazable de facts; a la derecha el detalle editable del elemento seleccionado. Reglas finas y una selección azul suave establecen jerarquía sin convertir el flujo en un dashboard.

La lista única ordena primero los facts textuales y después los inferidos. Cada fila muestra ID, origen, tipo, confianza y una vista previa del fact. El detalle muestra el ID como dato fijo, los campos editables, el estado de verificación y un área amplia para notas de investigación.

## Visual

Usar superficies neutras, reglas finas, tipografía de sistema y azul reservado para selección y acción principal. El tema oscuro se activa mediante `html.dark`, conserva contraste en controles nativos y foco visible. La interfaz no usa fuentes, imágenes ni recursos remotos.
