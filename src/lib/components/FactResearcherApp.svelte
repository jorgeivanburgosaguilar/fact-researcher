<script>
  import { onMount } from 'svelte';
  import { createReviewedDocument } from '$lib/facts/contracts.js';
  import { clearReviewDraft, loadReviewDraft, saveReviewDraft } from '$lib/facts/draft-storage.js';
  import { downloadReviewedDocument } from '$lib/facts/export.js';
  import { readFactsFile } from '$lib/facts/import-validation.js';
  import { normalizeReviewedDocument, updateHumanReviewAtIndex } from '$lib/facts/review.js';
  import FactsWorkbench from './FactsWorkbench.svelte';
  import FileImporter from './FileImporter.svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  /** @typedef {import('$lib/facts/contracts.js').ReviewedFactsDocument} ReviewedFactsDocument */
  /** @typedef {import('$lib/facts/draft-storage.js').ReviewDraft} ReviewDraft */
  /** @type {ReviewedFactsDocument | null} */
  let reviewedDocument = $state(null);
  let originalFilename = $state('');
  let importError = $state('');
  let storageNotice = $state('');
  /** @type {ReviewDraft | null} */ let savedDraft = $state(null);
  onMount(() => {
    const result = loadReviewDraft();
    if (result.ok) savedDraft = result.draft;
    else storageNotice = result.message;
  });
  /** @param {ReviewedFactsDocument} document @param {string} filename */
  function saveDraft(document, filename) {
    const result = saveReviewDraft({ document, originalFilename: filename });
    storageNotice = result.ok ? '' : result.message;
  }
  /** @param {File} file */
  async function importFile(file) {
    importError = '';
    try {
      const source = await readFactsFile(file);
      const document = normalizeReviewedDocument(createReviewedDocument(source));
      reviewedDocument = document;
      originalFilename = file.name;
      savedDraft = null;
      saveDraft(document, file.name);
    } catch (cause) {
      importError = cause instanceof Error ? cause.message : 'El archivo no contiene JSON válido.';
    }
  }
  function restoreDraft() {
    if (!savedDraft) return;
    reviewedDocument = normalizeReviewedDocument(savedDraft.document);
    originalFilename = savedDraft.originalFilename;
    savedDraft = null;
  }
  function discardDraft() {
    const result = clearReviewDraft();
    savedDraft = null;
    storageNotice = result.ok ? '' : result.message;
  }
  /** @param {number} index @param {import('$lib/facts/contracts.js').HumanReview} review */
  function reviewFact(index, review) {
    if (!reviewedDocument) return;
    const updated = updateHumanReviewAtIndex(reviewedDocument, index, review);
    reviewedDocument = updated;
    saveDraft(updated, originalFilename);
  }
  function exportDocument() {
    if (!reviewedDocument) return;
    const pending = reviewedDocument.facts.filter(
      (fact) => fact.human_review.status === 'pending'
    ).length;
    if (
      pending > 0 &&
      !window.confirm(
        `${pending} fact${pending === 1 ? '' : 's'} sigue pendiente. ¿Deseas exportar de todos modos?`
      )
    )
      return;
    downloadReviewedDocument(reviewedDocument, originalFilename);
    const result = clearReviewDraft();
    storageNotice = result.ok ? '' : result.message;
  }
</script>

<div class="min-h-screen bg-slate-50 dark:bg-slate-950">
  {#if !reviewedDocument}<div class="flex justify-end px-6 pt-4"><ThemeToggle /></div>{/if}
  {#if savedDraft}<section
      class="mx-auto mt-5 max-w-3xl border border-blue-700 bg-blue-50 p-5 text-slate-900 dark:border-blue-400 dark:bg-blue-950/60 dark:text-blue-50"
      aria-labelledby="draft-title"
    >
      <h1 id="draft-title" class="text-lg font-semibold">Hay una revisión guardada</h1>
      <p class="mt-1 text-sm leading-6">
        Puedes restaurar <span class="font-mono">{savedDraft.originalFilename}</span> o descartarla.
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          class="rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:outline-none"
          onclick={restoreDraft}>Restaurar revisión</button
        ><button
          type="button"
          class="rounded-md border border-slate-500 px-3 py-2 text-sm font-semibold dark:border-slate-400"
          onclick={discardDraft}>Descartar borrador</button
        >
      </div>
    </section>{/if}
  {#if storageNotice}<p
      class="mx-auto mt-4 max-w-3xl border-l border-amber-700 bg-amber-50 px-4 py-3 text-sm text-amber-950 dark:border-amber-400 dark:bg-amber-950/60 dark:text-amber-100"
      role="status"
      aria-live="polite"
    >
      {storageNotice} Puedes continuar revisando y exportar el documento.
    </p>{/if}
  {#if reviewedDocument}<FactsWorkbench
      facts={reviewedDocument.facts}
      filename={originalFilename}
      onreview={reviewFact}
      onexport={exportDocument}
    />{:else}<FileImporter onfile={importFile} error={importError} />{/if}
</div>
