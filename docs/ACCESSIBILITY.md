# Auditoría de accesibilidad y responsive

Fecha: 2026-09-15. Alcance: `FileImporter.svelte`, `FactsWorkbench.svelte` y `ReviewTray.svelte`, con revisión estática y pruebas de interacción de componentes. No se hicieron capturas: la ruta no está conectada a una sesión de navegador funcional en esta worktree.

## Resultado

| Dimensión                    | Puntuación | Hallazgo principal                                                                                                                                          |
| ---------------------------- | ---------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Accesibilidad                |        3/4 | Falta enlazar los botones de filtros y revisión con el contenido que controlan, y anunciar cambios de revisión.                                             |
| Rendimiento                  |        4/4 | No hay recursos remotos, imágenes ni trabajo de layout costoso en el flujo revisado.                                                                        |
| Responsive                   |        3/4 | El cambio tabla/tarjetas y los filtros plegables responde al contrato 390 px; los objetivos táctiles de enlaces de revisión siguen siendo menores de 44 px. |
| Tematización                 |        2/4 | Los colores Tailwind están repetidos como valores de implementación; no existen tokens ni modo oscuro documentado.                                          |
| Integridad de implementación |        3/4 | El patrón Evidence Calibration Ledger se expresa con evidencia adyacente, marcadores y etiquetas de estado; faltan conexiones ARIA finas.                   |
| **Total**                    |  **15/20** | **Bueno — corregir los puntos P1 antes de publicar.**                                                                                                       |

## Hallazgos priorizados

### P1 — Las bandejas y filtros no tienen relación programática con su disparador

- Ubicación: `src/lib/components/FactsWorkbench.svelte:119-126, 214-227, 252-260`.
- Impacto: `aria-expanded` anuncia el estado, pero no identifica qué región se despliega. En una lista larga, una persona que usa lector de pantalla pierde contexto tras abrir una revisión.
- Criterio: WCAG 4.1.2 (Nombre, función, valor) y el requisito del producto de recuperación predecible de foco.
- Recomendación: dar IDs estables a filtros y bandejas (`filters-panel`, `review-{index}`), añadir `aria-controls`, y al abrir mover el foco al `legend` o al select de decisión; al cerrar, devolverlo al botón disparador.

### P1 — Los cambios de decisión no se anuncian

- Ubicación: `src/lib/components/FactsWorkbench.svelte:55-64` y `ReviewTray.svelte:14-40`.
- Impacto: al cambiar el select, la barra de progreso y la insignia se actualizan visualmente, pero no hay confirmación inequívoca para lectores de pantalla. El contador visible no sustituye un anuncio de cambio de estado.
- Criterio: WCAG 4.1.3 (Mensajes de estado).
- Recomendación: integrar una región `aria-live="polite"` dedicada que anuncie, por ejemplo, “Fact a-1 marcado como Verídico; 2 de 5 revisados”. No anunciar cada pulsación en notas/corrección.

### P2 — Los enlaces de revisión no alcanzan el objetivo táctil recomendado

- Ubicación: `src/lib/components/FactsWorkbench.svelte:214-220, 252-257`.
- Impacto: los botones de texto tienen aproximadamente la altura de la línea (16–20 px) y resultan difíciles de tocar a 390 px.
- Criterio: WCAG 2.5.8 Target Size (Minimum), AA (24 × 24 CSS px); el contrato de diseño recomienda 44 × 44 px para controles táctiles directos.
- Recomendación: usar `min-h-11` y padding horizontal/vertical en los botones de revisión, manteniendo el subrayado como señal secundaria.

### P2 — El progreso usa transición de anchura sin alternativa de movimiento reducido

- Ubicación: `src/lib/components/FactsWorkbench.svelte:114-117`.
- Impacto: aunque es breve (200 ms), no respeta una preferencia explícita `prefers-reduced-motion`.
- Criterio: WCAG 2.3.3 (Animation from Interactions), nivel AAA como mejora; política de diseño del producto de movimiento quieto.
- Recomendación: añadir una variante `motion-reduce:transition-none`. El valor textual y ARIA ya preservan el significado sin la animación.

### P2 — El control de archivo visualmente oculto debe comprobarse con tecnología asistiva real

- Ubicación: `src/lib/components/FileImporter.svelte:63-75`.
- Impacto: tiene un nombre accesible y un botón nativo que abre el selector; aun así, el input `sr-only` permanece tabulable además del botón, lo que puede dar dos paradas equivalentes de teclado.
- Criterio: WCAG 2.4.3 (Orden del foco).
- Recomendación: decidir un único patrón: input asociado a un `<label>` visible, o botón que active un input con `tabindex="-1"`; validar el comportamiento final con NVDA/VoiceOver y navegador objetivo.

## Verificación 1440 / 390

- A 1440 px, la tabla mantiene la evidencia literal como columna independiente y el mínimo de 1000 px cabe dentro del contenedor de 1440 px.
- A 390 px, la tabla se reemplaza por tarjetas debajo de `md`, los filtros están plegados y el botón Exportar permanece en el encabezado. El texto de estado incluye símbolo y palabra (no depende sólo del color).
- Las pruebas nuevas cubren: nombre accesible del selector de archivo, alerta de importación, aviso de privacidad, labels de filtros, actualización de resultados, atributos del progreso, estado textual y apertura por teclado de la revisión.

## Aspectos positivos

- Los errores de importación usan `role="alert"` y los controles de formulario se asocian mediante `label`.
- El progreso incorpora `role="progressbar"`, mínimos, máximos y valor actual, además del contador visible.
- Pendiente, Verídico y Falso combinan palabra, símbolo y borde de color, cumpliendo el criterio de estado no sólo cromático.
- La estructura móvil no intenta comprimir la tabla: cambia a tarjetas legibles.

## Próximo pase

1. **P1 — `$impeccable harden`**: relaciones ARIA, foco de bandeja y anuncios de cambio de revisión.
2. **P2 — `$impeccable adapt`**: tamaño de objetivo táctil y `motion-reduce`.
3. **P2 — `$impeccable document`**: extraer tokens de color y decidir alcance de tema oscuro.
4. **P3 — `$impeccable polish`**: comprobar a 200 % de zoom y con lector de pantalla en la aplicación conectada.
