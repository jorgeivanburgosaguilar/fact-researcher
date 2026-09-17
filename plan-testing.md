# Plan: migrar las pruebas de navegador de Vitest a Playwright

## Contexto (estado actual verificado en el repo)

Hoy conviven **tres** estilos de prueba, mezclados bajo `vitest` y `playwright`:

1. **Lógica pura, sin DOM ni navegador** (proyecto `server` en `vite.config.js`, `environment: 'node'`):
   - `src/lib/facts/contracts.spec.js`
   - `src/lib/facts/export.spec.js`
   - `src/lib/facts/import-validation.spec.js`
   - `src/lib/facts/review.spec.js`

   Estas **no abren navegador** (ni real ni headless). No son el problema que reportó el usuario y **no necesitan migrarse**.

2. **Pruebas de componente en navegador real** (proyecto `client` en `vite.config.js`), usando `vitest-browser-svelte` + `@vitest/browser-playwright` (Vitest Browser Mode, que por debajo lanza un Chromium vía Playwright, pero orquestado por el test-runner de Vitest, no por `@playwright/test`):
   - `src/lib/components/FactResearcherApp.svelte.spec.js`
   - `src/lib/components/FactsWorkbench.svelte.spec.js`
   - `src/lib/components/FileImporter.svelte.spec.js`
   - `src/lib/components/ThemeToggle.svelte.spec.js`
   - `src/lib/facts/draft-storage.browser.spec.js` (este último **no monta ningún componente**; solo necesita el global `localStorage`, así que técnicamente no requiere un navegador real, ver Paso 2).

   Este es el grupo que el usuario quiere eliminar.

3. **E2E ya en Playwright** (`@playwright/test`, config en `playwright.config.js`, carpeta `e2e/`):
   - `e2e/simple-notes.spec.js` — ya cubre, contra la app real corriendo en `http://127.0.0.1:4173`, un flujo muy parecido al de `FactResearcherApp.svelte.spec.js` (importar JSON, cambiar tema, revisar un fact, recargar y restaurar borrador, exportar y confirmar diálogo).

Convención documentada en `AGENTS.md` (hay que actualizarla, ver Paso 9):

> "Use `.spec.js` para lógica pura, `.browser.spec.js` para APIs de navegador, y `.svelte.spec.js` para componentes."

No existe ningún workflow de CI en `.github/` todavía, así que no hay que romper ningún pipeline existente, pero si el usuario pide CI después, este plan deja el terreno listo (un único comando de navegador: `pnpm test:e2e`, ya headless por config).

## Decisión de diseño (léela antes de empezar a picar código)

Cada uno de los 4 `*.svelte.spec.js` monta el componente **aislado**, con props fabricadas y espías (`vi.fn`) en los callbacks. Playwright no tiene una forma nativa de montar un componente Svelte aislado en este proyecto (no está instalado `@playwright/experimental-ct-svelte`, y añadirlo:

- es una API marcada como _experimental_,
- duplicaría el mecanismo de arranque de navegador que ya existe para `e2e/`,
- y su soporte con Svelte 5 (runes) no está garantizado — verificarlo sería trabajo extra sin beneficio claro).

**Recomendación: no usar Playwright Component Testing.** En su lugar, reescribe cada caso como una prueba end-to-end contra la app real (como ya hace `e2e/simple-notes.spec.js`), porque **los cuatro componentes son alcanzables desde la UI real** (`FileImporter` y `ThemeToggle` están en la página principal; `FactsWorkbench` aparece tras importar un archivo). No hace falta ninguna ruta/harness de prueba dedicada.

Esto cambia el _estilo_ de aserción en algunos casos:

- Un espía (`expect(onreview).toHaveBeenCalledWith(...)`) se reemplaza por una aserción sobre el DOM o el estado persistido (p. ej. leer `localStorage` con `page.evaluate`, o comprobar el valor de un `<select>`/`<textarea>` tras la interacción). Esto es igual de válido y en realidad prueba más integración real.
- Los mocks de módulo/objeto en el mismo proceso (`vi.spyOn(window, 'matchMedia')`, `vi.spyOn(Storage.prototype, ...)`) no existen en Playwright porque el test corre en Node y el navegador es un proceso aparte. Se reemplazan con:
  - `page.emulateMedia({ colorScheme: 'dark' | 'light' })` — API nativa de Playwright, más simple que el mock manual de `matchMedia` que hay hoy.
  - `page.addInitScript(...)` para inyectar overrides de `Storage.prototype.getItem/setItem` **antes** de que cargue cualquier script de la página, cuando haga falta simular fallos de almacenamiento.

Si al ejecutar este plan alguna aserción resulta imposible de reproducir sin aislar el componente (no debería pasar, pero anótalo si ocurre), detente y repórtalo en vez de forzar un harness ad-hoc — eso es una decisión de arquitectura, no de migración mecánica.

## Pasos

### Paso 0 — Línea base

1. Ejecuta `pnpm test` y `pnpm test:e2e` en el estado actual del repo y guarda la lista de tests que pasan (nombre + archivo). Esta lista es el criterio de "no regresión": cada aserción debe tener un equivalente al final.
2. Anota el conteo exacto de tests por archivo de los 5 archivos a migrar (Grupo 2 de arriba).

### Paso 1 — `draft-storage.browser.spec.js`: no requiere Playwright

Este archivo no renderiza ningún componente, solo llama a funciones de `draft-storage.js` contra `localStorage`. Dos opciones, elige la más simple de implementar sin romper cobertura:

- **Opción A (recomendada):** muévelo al proyecto `server` (Node) de Vitest, usando un objeto `Storage` falso mínimo (una clase con `getItem`/`setItem`/`removeItem` en memoria) en vez del `localStorage` real del navegador, y renómbralo a `src/lib/facts/draft-storage.spec.js` (ya no necesita el sufijo `.browser`).
- **Opción B:** si prefieres probarlo contra `localStorage` real de un navegador, fusiona sus casos dentro de un test de Playwright en `e2e/` (el caso "restaura un borrador guardado" ya está cubierto por `e2e/simple-notes.spec.js`; solo faltarían los casos de "datos corruptos no se restauran" y "storage no disponible", que se pueden probar con `page.addInitScript` para corromper `localStorage` o hacer que `Storage.prototype.setItem` lance).

Verifica que los 3 casos de este archivo (guardar/restaurar/limpiar, datos corruptos, storage no disponible) sigan cubiertos tras elegir A o B.

### Paso 2 — `FileImporter.svelte.spec.js` → `e2e/file-importer.spec.js`

Casos a portar (contra la página real `/`):

- El botón "Seleccionar archivo" es visible y el input de archivo tiene label "Seleccionar archivo JSON"; hacer click en el botón no debe disparar ningún callback observable (en e2e esto se traduce en: no aparece ningún fact ni error tras el click solo).
- Subir un archivo `.txt` (no JSON) con `page.getByLabel('Seleccionar archivo JSON').setInputFiles(...)` debe mostrar un `role=alert` con el texto exacto: `"No se pudo importar. Selecciona un archivo con extensión .json."`.
- El aviso de privacidad (`getByLabelText('Privacidad')`, texto "No se sube a un servidor") es visible en todo momento.

### Paso 3 — `ThemeToggle.svelte.spec.js` → `e2e/theme-toggle.spec.js`

Casos a portar:

- Con `localStorage['fact-researcher-theme'] = 'dark'` inyectado vía `page.addInitScript`, al cargar la página el `<select>` con label "Tema" debe tener valor `dark` y `<html>` debe tener la clase `dark`. Cambiar a `light` y luego otra vez a `dark` debe alternar la clase en `<html>` (patrón ya usado en `e2e/simple-notes.spec.js` línea 9).
- Selecciona "Sistema" y usa `page.emulateMedia({ colorScheme: 'dark' })` / `{ colorScheme: 'light' }` **después** de seleccionar "Sistema" para verificar que la clase `dark` en `<html>` reacciona al cambio de preferencia del SO (reemplaza el mock manual de `matchMedia` + `emit`).
- Simula fallo de `localStorage` con `page.addInitScript` que sobreescriba `Storage.prototype.getItem` y `Storage.prototype.setItem` para que lancen una excepción, antes de `page.goto('/')`. Verifica que el `<select>` cae a `system` sin romper la página, y que se puede seleccionar `dark` igualmente (aplica la clase aunque no pueda persistir).

### Paso 4 — `FactsWorkbench.svelte.spec.js` → contenido nuevo dentro de `e2e/` (puede ir en un archivo nuevo `e2e/facts-workbench.spec.js` o ampliar `e2e/simple-notes.spec.js`, decide por cohesión de escenario)

Importa un JSON con los mismos 2 facts de ejemplo del spec actual vía `setInputFiles` (como ya hace `e2e/simple-notes.spec.js`) y verifica:

- El texto de cada fact es visible, aparece "Categoría:" y el `<select>` "Estado" muestra `pending`/`verified` según el fact, y el textarea "Notas" es visible.
- El texto "Buscar" **no** está en la página (esta aserción negativa existe hoy en el código pero la funcionalidad de búsqueda no está implementada en `FactsWorkbench.svelte` — confírmalo con `grep -n "Buscar" src/lib/components/FactsWorkbench.svelte` antes de portar; si sigue sin existir, la aserción es válida tal cual).
- El botón "Exportar JSON" es visible.
- Cambiar el `<select>` "Estado" a `verified` y rellenar "Notas" — en vez de comprobar un espía `onreview`, comprueba el efecto observable: lee el borrador persistido con `page.evaluate(() => localStorage.getItem(...))` y compara el JSON parseado contra el `human_review` esperado (mismo patrón que ya usa `e2e/simple-notes.spec.js` líneas 35-38).
- El texto "Corrección propuesta" no debe aparecer cuando no hay corrección.

### Paso 5 — `FactResearcherApp.svelte.spec.js` → fusionar con `e2e/simple-notes.spec.js`

El primer test (importar, revisar, guardar borrador, restaurar) ya está cubierto casi 1:1 por `e2e/simple-notes.spec.js`; compara aserción por aserción y añade lo que falte (por ejemplo, la comprobación explícita de `stored.originalFilename === 'notas.json'` vía `page.evaluate`).

El segundo test ("confirma exportación cuando aún hay facts sin verificar") **no está cubierto** por el e2e actual y hay que añadirlo, usando el manejo de diálogos nativo de Playwright:

```js
page.once('dialog', (dialog) => {
  expect(dialog.type()).toBe('confirm');
  dialog.dismiss(); // simula "Cancelar" en window.confirm -> false
});
await page.getByRole('button', { name: 'Exportar JSON' }).click();
// aserta que NO se disparó ninguna descarga
```

(Nota: `e2e/simple-notes.spec.js` ya usa `dialog.accept()` para el caso "todo revisado"; este nuevo caso es su contraparte con `dialog.dismiss()`.)

### Paso 6 — Borrar los archivos migrados

Una vez que cada caso tenga su equivalente en `e2e/` (o en el proyecto `server` para el Paso 1-Opción A) y todo pase:

```
git rm src/lib/components/FactResearcherApp.svelte.spec.js
git rm src/lib/components/FactsWorkbench.svelte.spec.js
git rm src/lib/components/FileImporter.svelte.spec.js
git rm src/lib/components/ThemeToggle.svelte.spec.js
git rm src/lib/facts/draft-storage.browser.spec.js   # o mv si elegiste la Opción A del Paso 1
```

### Paso 7 — Simplificar `vite.config.js`

Elimina por completo el proyecto `client` (bloque `browser: { enabled: true, provider: playwright(), ... }`) y el import de `@vitest/browser-playwright`. Deja solo el proyecto de lógica pura en Node, por ejemplo:

```js
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  test: {
    expect: { requireAssertions: true },
    environment: 'node',
    include: ['src/**/*.{test,spec}.js']
  }
});
```

Ajusta el `include`/`exclude` si mantuviste el patrón `projects` por alguna razón, pero ya no hace falta separar `client`/`server`.

### Paso 8 — Limpiar dependencias y scripts

```
pnpm remove @vitest/browser-playwright vitest-browser-svelte
```

Revisa `package.json`:

- `test`: sigue siendo `vitest run` (ahora solo corre lógica pura, sin navegador).
- `test:unit`: sigue siendo `vitest` (watch mode de lógica pura).
- `test:e2e`: sin cambios, `playwright test -c playwright.config.js`.
- Considera añadir un script `test:all` que corra ambos (`vitest run && playwright test`) si se quiere un solo comando de verificación completa.

### Paso 9 — Actualizar `AGENTS.md`

Reemplaza la línea:

> "Use `.spec.js` for pure logic, `.browser.spec.js` for browser APIs, and `.svelte.spec.js` for components."

por algo como:

> "Use `.spec.js` (Vitest, Node) for pure logic with no DOM or browser. Use Playwright specs under `e2e/` for anything that touches the DOM, browser APIs, or full app behavior — run headless via `pnpm test:e2e`."

### Paso 10 — Validación final

1. `pnpm format`, `pnpm check`, `pnpm lint`.
2. `pnpm test` (solo debe correr los 4 archivos de lógica pura + el que movió el Paso 1 si elegiste la Opción A).
3. `pnpm test:e2e` — todos los `.spec.js` de `e2e/` en verde, incluyendo los nuevos.
4. Compara contra la lista del Paso 0: cada aserción original debe tener un equivalente ejecutado (documenta cualquier caso que se haya dejado fuera y por qué).
5. Confirma que `node_modules` ya no trae Chromium duplicado innecesario (Vitest Browser Mode y Playwright pueden compartir el mismo binario de Chromium vía Playwright, pero al quitar `@vitest/browser-playwright` ya no hay dos mecanismos de lanzamiento de navegador activos).

## Fuera de alcance (no lo hagas salvo que el usuario lo pida explícitamente)

- Crear un workflow de CI (`.github/workflows/*.yml`). Este plan deja el repo listo para eso (un solo comando de navegador, headless), pero no lo crea.
- Cambiar `playwright.config.js` para servir la build de producción (`vite preview`) en vez del servidor de desarrollo (`vite --host ... --port 4173`). Es una mejora razonable para que el e2e valide el build real, pero es un cambio independiente de esta migración — anótalo como posible follow-up, no lo mezcles con este plan.
- Añadir cobertura nueva para `AppShell.svelte` o `ReviewTray.svelte` (hoy sin pruebas). No es parte de la migración, es una brecha de cobertura preexistente.
