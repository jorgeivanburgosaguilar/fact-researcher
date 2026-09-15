<script>
  import { createReviewedDocument } from '$lib/facts/contracts.js';
  import FileImporter from './FileImporter.svelte';
  import FactsWorkbench from './FactsWorkbench.svelte';

  /** @typedef {import('$lib/facts/contracts.js').ReviewedFact} ReviewedFact */
  /** @typedef {{ initialFacts?: ReviewedFact[], initialFilename?: string, onimport?: (file: File) => Promise<ReviewedFact[]> | ReviewedFact[], onexport?: (facts: ReviewedFact[], filename: string) => void }} Props */
  /** @type {Props} */
  let { initialFacts = [], initialFilename = '', onimport, onexport = () => {} } = $props();
  let facts = $state(initialFacts);
  let filename = $state(initialFilename);
  let error = $state('');

  /** @param {File} file */
  async function importFile(file) {
    error = '';
    try {
      if (onimport) {
        facts = await onimport(file);
      } else {
        const source = JSON.parse(await file.text());
        if (!source || !Array.isArray(source.facts))
          throw new Error('La raíz debe contener un arreglo facts.');
        facts = createReviewedDocument(source).facts;
      }
      filename = file.name;
    } catch (cause) {
      error = cause instanceof Error ? cause.message : 'El archivo no contiene JSON válido.';
    }
  }

  /** @param {number} index @param {ReviewedFact['human_review']} review */
  function reviewFact(index, review) {
    facts = facts.map((fact, factIndex) =>
      factIndex === index ? { ...fact, human_review: review } : fact
    );
  }
</script>

{#if facts.length}
  <FactsWorkbench
    {facts}
    {filename}
    onreview={reviewFact}
    onexport={() => onexport(facts, filename)}
  />
{:else}
  <FileImporter onfile={importFile} {error} />
{/if}
