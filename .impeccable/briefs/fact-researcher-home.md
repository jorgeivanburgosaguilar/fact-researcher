---
version: 3
slug: 'src-routes-page-svelte'
primary_target: 'src/routes/+page.svelte'
related_targets: []
---

# Fact Researcher — lista simple de revisión

## Superficie

Modo Operate, desktop-first. El usuario importa un JSON, ve todos los facts en una lista y escribe una nota y un estado por fila. Cada fila tiene dos columnas: ID y fact original a la izquierda; categoría, notas y estado a la derecha.

## Estados y privacidad

La superficie cubre importación válida e inválida, borrador restaurable, fallo de almacenamiento, revisión y exportación confirmable si hay facts sin verificar. Los estados se expresan con etiquetas accesibles: Sin verificar, Correcto e Incorrecto. Todo se procesa localmente, sin red ni tracking.

## Límites

No incluye filtros, búsqueda, progreso, contadores, evidencia independiente, corrección propuesta, paneles expandibles ni diseño móvil. El encabezado solo contiene filename, tema y exportar. El tema Sistema/Claro/Oscuro se aplica con `html.dark`.
