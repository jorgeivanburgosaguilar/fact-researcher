<script>
  // @ts-nocheck
  /** @typedef {{ onfile?: (file: File) => void, ontext?: (text: string) => void, error?: string }} Props */
  let { onfile = () => {}, ontext = () => {}, error = '' } = $props();
  let input;
  let pasted = $state('');
  let localError = $state('');
  function selectFile(file) {
    localError = '';
    if (!file) return;
    if (file.name !== 'result.json') {
      localError = 'Selecciona exactamente un archivo llamado result.json.';
      return;
    }
    onfile(file);
  }
  function submitText() {
    localError = '';
    if (!pasted.trim()) {
      localError = 'Pega el contenido de result.json para importarlo.';
      return;
    }
    ontext(pasted);
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
    <p class="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-300">
      Importa un <code>result.json</code> para editar sus facts y completar su verificación.
    </p>
  </div>
  <div class="mt-8 grid gap-6 sm:grid-cols-2">
    <section
      class="border border-dashed border-slate-400 p-6 dark:border-slate-600"
      aria-labelledby="file-title"
    >
      <h2 id="file-title" class="text-lg font-semibold">Subir result.json</h2>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Elige el archivo local generado por tu investigación.
      </p>
      <button
        type="button"
        class="mt-5 rounded-md bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-blue-600 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-950"
        onclick={() => input?.click()}>Seleccionar archivo</button
      ><input
        bind:this={input}
        class="sr-only"
        type="file"
        accept="application/json,.json"
        aria-label="Seleccionar archivo result.json"
        onchange={(event) => selectFile(event.currentTarget.files?.[0])}
      />
    </section>
    <section
      class="border border-slate-300 p-6 dark:border-slate-600"
      aria-labelledby="paste-title"
    >
      <h2 id="paste-title" class="text-lg font-semibold">Pegar JSON</h2>
      <label class="mt-3 block text-sm font-semibold" for="result-json"
        >Contenido de result.json</label
      ><textarea
        id="result-json"
        class="mt-1 min-h-28 w-full rounded-md border-slate-300 bg-white p-2 font-mono text-xs focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-950"
        bind:value={pasted}
      ></textarea><button
        type="button"
        class="mt-3 rounded-md border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-blue-400 dark:text-blue-200 dark:focus-visible:ring-blue-400 dark:focus-visible:ring-offset-slate-950"
        onclick={submitText}>Procesar JSON pegado</button
      >
    </section>
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
      El contenido se procesa únicamente en este navegador. No se sube a un servidor.
    </p>
  </aside>
</section>
