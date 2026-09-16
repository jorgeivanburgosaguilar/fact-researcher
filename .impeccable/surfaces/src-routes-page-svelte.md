---
version: 2
slug: 'src-routes-page-svelte'
primary_target: 'src/routes/+page.svelte'
related_targets: []
---

# Fact Researcher — lista simple de revisión

## Superficie

Modo Operate, desktop-first. El usuario importa un JSON, ve todos los facts en una lista y escribe una nota y un estado por fila. Cada fila tiene dos columnas: ID/fact original a la izquierda; categoría, notas y estado a la derecha.

## Estados

La superficie cubre importación válida e inválida, borrador restaurable, fallo de almacenamiento, revisión y exportación confirmable si hay facts sin verificar. Los estados se expresan con etiquetas accesibles: Sin verificar, Correcto e Incorrecto.

## Límites

No incluye filtros, búsqueda, progreso, contadores, evidencia visible independiente, corrección propuesta, paneles expandibles ni diseño móvil. El encabezado solo contiene filename, tema y exportar. No hay red, tracking ni assets externos.
