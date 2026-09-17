<script>
  // @ts-nocheck
  import { onMount } from 'svelte';
  import { clearReviewDraft, loadReviewDraft, saveReviewDraft } from '$lib/facts/draft-storage.js';
  import { downloadReviewedDocument } from '$lib/facts/export.js';
  import { parseResultJson, readResultFile } from '$lib/facts/import-validation.js';
  import {
    deleteFactAtIndex,
    normalizeResultDocument,
    updateFactAtIndex
  } from '$lib/facts/review.js';
  import FactsWorkbench from './FactsWorkbench.svelte';
  import FileImporter from './FileImporter.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  let document = $state(null);
  let originalFilename = $state('');
  let importError = $state('');
  let storageNotice = $state('');
  let savedDraft = $state(null);
  onMount(() => {
    const result = loadReviewDraft();
    if (result.ok) savedDraft = result.draft;
    else storageNotice = result.message;
  });
  function save(documentToSave, filename) {
    const result = saveReviewDraft({ document: documentToSave, originalFilename: filename });
    storageNotice = result.ok ? '' : result.message;
  }
  function load(source, filename) {
    document = normalizeResultDocument(source);
    originalFilename = filename;
    savedDraft = null;
    save(document, filename);
  }
  async function importFile(file) {
    importError = '';
    try {
      load(await readResultFile(file), file.name);
    } catch (cause) {
      importError = cause instanceof Error ? cause.message : 'El archivo no contiene JSON válido.';
    }
  }
  function importText(text) {
    importError = '';
    try {
      load(parseResultJson(text), 'result.json');
    } catch (cause) {
      importError =
        cause instanceof Error ? cause.message : 'El contenido no contiene JSON válido.';
    }
  }
  function restoreDraft() {
    if (!savedDraft) return;
    load(savedDraft.document, savedDraft.originalFilename);
  }
  function discardDraft() {
    const result = clearReviewDraft();
    savedDraft = null;
    storageNotice = result.ok ? '' : result.message;
  }
  function updateFact(group, index, changes) {
    if (!document) return;
    document = updateFactAtIndex(document, group, index, changes);
    save(document, originalFilename);
  }
  function deleteFact(group, index) {
    if (!document) return;
    document = deleteFactAtIndex(document, group, index);
    save(document, originalFilename);
  }
  function exportDocument() {
    if (!document) return;
    downloadReviewedDocument(document, originalFilename);
    const result = clearReviewDraft();
    storageNotice = result.ok ? '' : result.message;
  }
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950">
  {#if !document}<div class="flex justify-end px-6 pt-4">
      <ThemeToggle />
    </div>{/if}{#if savedDraft && !document}<section
      class="mx-auto mt-5 max-w-3xl border border-blue-700 bg-blue-50 p-5"
      aria-labelledby="draft-title"
    >
      <h1 id="draft-title" class="text-lg font-semibold">Hay un borrador guardado</h1>
      <p class="mt-1 text-sm">
        Puedes restaurar <span class="font-mono">{savedDraft.originalFilename}</span> o descartarlo.
      </p>
      <div class="mt-4 flex gap-3">
        <button
          type="button"
          class="rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none"
          onclick={restoreDraft}>Restaurar borrador</button
        ><button
          type="button"
          class="rounded border px-3 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none"
          onclick={discardDraft}>Descartar borrador</button
        >
      </div>
    </section>{/if}{#if storageNotice}<p
      class="mx-auto mt-4 max-w-3xl border-l border-amber-700 bg-amber-50 px-4 py-3 text-sm"
      role="status"
    >
      {storageNotice}
    </p>{/if}{#if document}<FactsWorkbench
      {document}
      filename={originalFilename}
      onupdate={updateFact}
      ondelete={deleteFact}
      onexport={exportDocument}
    />{:else}<FileImporter onfile={importFile} ontext={importText} error={importError} />{/if}
</div>
