<script>
  /** @typedef {{ onfile?: (file: File) => void, error?: string }} Props */
  /** @type {Props} */ let { onfile = () => {}, error = '' } = $props();
  /** @type {HTMLInputElement | undefined} */ let input;
  let dragActive = $state(false);
  let localError = $state('');
  /** @param {File | undefined} file */ function selectFile(file) {
    localError = '';
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json')) {
      localError = 'Selecciona un archivo con extensión .json.';
      return;
    }
    onfile(file);
  }
  /** @param {DragEvent} event */ function dropFile(event) {
    event.preventDefault();
    dragActive = false;
    selectFile(event.dataTransfer?.files[0]);
  }
</script>

<section
  class="mx-auto w-full max-w-3xl px-5 py-10 text-slate-950 sm:px-8 sm:py-16 dark:text-slate-100"
  aria-labelledby="import-title"
>
  <div class="border-b border-slate-300 pb-7 dark:border-slate-700">
    <p
      class="font-mono text-xs font-bold tracking-[0.16em] text-blue-700 uppercase dark:text-blue-300"
    >
      Registro local
    </p>
    <h1 id="import-title" class="mt-3 text-4xl font-semibold tracking-[-0.035em]">
      Fact Researcher
    </h1>
    <p class="mt-3 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300">
      Importa un documento de facts para añadir tus notas y marcar cada afirmación.
    </p>
  </div>
  <div
    class:!border-blue-700={dragActive}
    class:bg-blue-50={dragActive}
    class:dark:bg-blue-950={dragActive}
    class="mt-8 border border-dashed border-slate-400 p-7 transition-colors sm:p-10 dark:border-slate-600"
    role="group"
    aria-labelledby="drop-title"
    ondragenter={(event) => {
      event.preventDefault();
      dragActive = true;
    }}
    ondragover={(event) => event.preventDefault()}
    ondragleave={() => (dragActive = false)}
    ondrop={dropFile}
  >
    <div class="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
      <div>
        <h2 id="drop-title" class="text-lg font-semibold">Abre un JSON de facts</h2>
        <p class="mt-1 max-w-lg text-sm leading-6 text-slate-600 dark:text-slate-300">
          Arrastra el archivo aquí o selecciónalo desde tu equipo. Solo se aceptan archivos JSON.
        </p>
      </div>
      <button
        type="button"
        class="rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:outline-none"
        onclick={() => input?.click()}>Seleccionar archivo</button
      >
    </div>
    <input
      bind:this={input}
      class="sr-only"
      type="file"
      accept="application/json,.json"
      aria-label="Seleccionar archivo JSON"
      onchange={(event) => selectFile(event.currentTarget.files?.[0])}
    />
  </div>
  {#if error || localError}<p
      class="mt-4 border-l border-red-700 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-400 dark:bg-red-950/60 dark:text-red-100"
      role="alert"
    >
      <span class="font-semibold">No se pudo importar.</span>
      {error || localError}
    </p>{/if}
  <aside class="mt-6 border-t border-slate-300 pt-5 dark:border-slate-700" aria-label="Privacidad">
    <h2 class="text-sm font-semibold">Privado por diseño</h2>
    <p class="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
      El archivo se procesa en este navegador. No se sube a un servidor ni se realizan solicitudes
      de red.
    </p>
  </aside>
</section>
