<script>
  import { CONFIDENCE_LEVELS, FACT_TYPES, REVIEW_STATUSES } from '$lib/facts/contracts.js';
  import ReviewTray from './ReviewTray.svelte';

  /** @typedef {import('$lib/facts/contracts.js').ReviewedFact} ReviewedFact */
  /** @typedef {import('$lib/facts/contracts.js').ReviewStatus} ReviewStatus */
  /** @typedef {{ facts?: ReviewedFact[], filename?: string, onreview?: (index: number, review: ReviewedFact['human_review']) => void, onexport?: () => void }} Props */

  /** @type {Props} */
  let {
    facts = [],
    filename = 'documento.json',
    onreview = () => {},
    onexport = () => {}
  } = $props();

  let query = $state('');
  let statusFilter = $state('all');
  let typeFilter = $state('all');
  let confidenceFilter = $state('all');
  let filtersOpen = $state(false);
  /** @type {number | null} */
  let openIndex = $state(null);

  const statusLabel = { pending: 'Pendiente', verified: 'Verídico', rejected: 'Falso' };
  const statusSymbol = { pending: '○', verified: '✓', rejected: '×' };
  const statusStyle = {
    pending: 'border-amber-700 bg-amber-50 text-amber-950',
    verified: 'border-emerald-700 bg-emerald-50 text-emerald-950',
    rejected: 'border-red-700 bg-red-50 text-red-950'
  };
  const statusMarker = {
    pending: 'border-l-amber-700',
    verified: 'border-l-emerald-700',
    rejected: 'border-l-red-700'
  };

  const reviewedCount = $derived(
    facts.filter((item) => item.human_review.status !== 'pending').length
  );
  const filteredFacts = $derived(
    facts
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => {
        const haystack = `${item.id} ${item.fact} ${item.verbatim ?? ''}`.toLowerCase();
        return (
          haystack.includes(query.toLowerCase()) &&
          (statusFilter === 'all' || item.human_review.status === statusFilter) &&
          (typeFilter === 'all' || item.type === typeFilter) &&
          (confidenceFilter === 'all' || item.confidence === confidenceFilter)
        );
      })
  );

  /** @param {number} index @param {ReviewedFact['human_review']} review */
  function updateReview(index, review) {
    onreview(index, review);
  }

  /** @param {number} index @param {ReviewedFact} item */
  function toggleReview(index, item) {
    openIndex = openIndex === index ? null : index;
    if (openIndex === index) updateReview(index, item.human_review);
  }
</script>

<main class="min-h-screen bg-slate-50 text-slate-950">
  <header class="border-b border-slate-300 bg-white">
    <div class="mx-auto flex max-w-[1440px] items-start justify-between gap-5 px-5 py-5 sm:px-8">
      <div>
        <p class="font-mono text-xs font-bold tracking-[0.14em] text-blue-700 uppercase">
          Evidence calibration ledger
        </p>
        <h1 class="mt-1 text-2xl font-semibold tracking-[-0.03em]">Fact Researcher</h1>
        <p class="mt-1 text-sm text-slate-600">
          <span class="font-mono">{filename}</span> · solo en este dispositivo
        </p>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-md bg-blue-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 focus-visible:outline-none"
        onclick={onexport}
      >
        Exportar
      </button>
    </div>
  </header>

  <section class="mx-auto max-w-[1440px] px-5 py-5 sm:px-8" aria-label="Controles de revisión">
    <div class="border-y border-slate-300 py-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex min-w-[14rem] items-center gap-3">
          <span
            class="grid h-10 w-10 place-items-center border border-blue-700 font-mono text-sm font-bold text-blue-800"
            >{reviewedCount}/{facts.length}</span
          >
          <div>
            <p class="text-sm font-semibold">Revisión registrada</p>
            <p class="text-xs text-slate-600">
              {facts.length - reviewedCount} pendiente{facts.length - reviewedCount === 1
                ? ''
                : 's'}
            </p>
          </div>
        </div>
        <div
          class="h-2 w-full max-w-sm overflow-hidden bg-slate-200"
          aria-label={`${reviewedCount} de ${facts.length} revisados`}
          role="progressbar"
          aria-valuenow={reviewedCount}
          aria-valuemin="0"
          aria-valuemax={facts.length}
        >
          <div
            class="h-full bg-blue-700 transition-[width] duration-200"
            style={`width: ${facts.length ? (reviewedCount / facts.length) * 100 : 0}%`}
          ></div>
        </div>
        <button
          class="rounded-md border border-slate-400 px-3 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none lg:hidden"
          type="button"
          aria-expanded={filtersOpen}
          onclick={() => (filtersOpen = !filtersOpen)}
        >
          {filtersOpen ? 'Ocultar filtros' : 'Mostrar filtros'}
        </button>
      </div>

      <div class:!hidden={!filtersOpen} class="mt-4 grid gap-3 lg:grid lg:grid-cols-4">
        <label class="block text-xs font-semibold text-slate-700"
          >Buscar
          <input
            bind:value={query}
            class="mt-1 block w-full rounded-md border-slate-400 text-sm focus:border-blue-700 focus:ring-blue-700"
            placeholder="ID, fact o evidencia"
          />
        </label>
        <label class="block text-xs font-semibold text-slate-700"
          >Estado
          <select
            bind:value={statusFilter}
            class="mt-1 block w-full rounded-md border-slate-400 text-sm focus:border-blue-700 focus:ring-blue-700"
            ><option value="all">Todos</option>{#each REVIEW_STATUSES as status (status)}<option
                value={status}>{statusLabel[status]}</option
              >{/each}</select
          >
        </label>
        <label class="block text-xs font-semibold text-slate-700"
          >Tipo
          <select
            bind:value={typeFilter}
            class="mt-1 block w-full rounded-md border-slate-400 text-sm focus:border-blue-700 focus:ring-blue-700"
            ><option value="all">Todos</option>{#each FACT_TYPES as type (type)}<option value={type}
                >{type}</option
              >{/each}</select
          >
        </label>
        <label class="block text-xs font-semibold text-slate-700"
          >Confianza
          <select
            bind:value={confidenceFilter}
            class="mt-1 block w-full rounded-md border-slate-400 text-sm focus:border-blue-700 focus:ring-blue-700"
            ><option value="all">Todas</option
            >{#each CONFIDENCE_LEVELS as confidence (confidence)}<option value={confidence}
                >{confidence}</option
              >{/each}</select
          >
        </label>
      </div>
    </div>

    <p class="mt-4 text-sm text-slate-600" aria-live="polite">
      Mostrando {filteredFacts.length} de {facts.length} facts.
    </p>

    {#if filteredFacts.length === 0}
      <div class="mt-4 border border-slate-300 bg-white p-8 text-center">
        <h2 class="text-lg font-semibold">No hay facts para estos filtros</h2>
        <p class="mt-2 text-sm text-slate-600">
          Ajusta la búsqueda o restaura algún filtro para continuar.
        </p>
      </div>
    {:else}
      <div class="mt-4 hidden overflow-x-auto border border-slate-300 bg-white md:block">
        <table class="w-full min-w-[1000px] border-collapse text-left">
          <thead
            class="border-b border-slate-300 bg-slate-100 text-xs font-bold tracking-[0.08em] text-slate-700 uppercase"
            ><tr
              ><th class="px-3 py-3">ID</th><th class="px-3 py-3">Fact</th><th class="px-3 py-3"
                >Evidencia literal</th
              ><th class="px-3 py-3">Metadatos</th><th class="px-3 py-3">Estado</th><th
                class="px-3 py-3"><span class="sr-only">Revisar</span></th
              ></tr
            ></thead
          >
          <tbody>
            {#each filteredFacts as { item, index } (index)}
              <tr class="border-b border-slate-200 align-top hover:bg-slate-50"
                ><td
                  class={`border-l ${statusMarker[item.human_review.status]} px-3 py-4 font-mono text-sm`}
                  >{item.id}</td
                ><td class="max-w-md px-3 py-4 text-sm leading-6 font-medium">{item.fact}</td><td
                  class="max-w-md px-3 py-4 text-sm leading-6 text-slate-600"
                  >{item.verbatim ?? 'Sin evidencia literal'}</td
                ><td class="px-3 py-4 font-mono text-xs text-slate-600"
                  >{item.type}<br />{item.confidence}</td
                ><td class="px-3 py-4"
                  ><span
                    class={`inline-flex items-center gap-1 border px-2 py-1 text-xs font-semibold ${statusStyle[item.human_review.status]}`}
                    ><span aria-hidden="true">{statusSymbol[item.human_review.status]}</span
                    >{statusLabel[item.human_review.status]}</span
                  ></td
                ><td class="px-3 py-4"
                  ><button
                    type="button"
                    class="text-sm font-semibold text-blue-800 underline decoration-1 underline-offset-4 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none"
                    aria-expanded={openIndex === index}
                    onclick={() => toggleReview(index, item)}
                    >{openIndex === index ? 'Cerrar' : 'Revisar'}</button
                  ></td
                ></tr
              >
              {#if openIndex === index}
                <tr class="border-b-2 border-blue-700 bg-blue-50"
                  ><td colspan="6" class="p-5"
                    ><ReviewTray {item} onupdate={(review) => updateReview(index, review)} /></td
                  ></tr
                >
              {/if}
            {/each}
          </tbody>
        </table>
      </div>
      <div class="mt-4 grid gap-3 md:hidden">
        {#each filteredFacts as { item, index } (index)}
          <article
            class={`border border-l border-slate-300 ${statusMarker[item.human_review.status]} bg-white p-4`}
          >
            <div class="flex items-start justify-between gap-3">
              <span class="font-mono text-xs text-slate-600"
                >#{item.id} · {item.type} · {item.confidence}</span
              ><span
                class={`inline-flex shrink-0 items-center gap-1 border px-2 py-1 text-xs font-semibold ${statusStyle[item.human_review.status]}`}
                ><span aria-hidden="true">{statusSymbol[item.human_review.status]}</span
                >{statusLabel[item.human_review.status]}</span
              >
            </div>
            <h2 class="mt-3 text-base leading-6 font-semibold">{item.fact}</h2>
            <p class="mt-3 border-t border-slate-200 pt-3 text-sm leading-6 text-slate-600">
              {item.verbatim ?? 'Sin evidencia literal'}
            </p>
            <button
              type="button"
              class="mt-4 text-sm font-semibold text-blue-800 underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:outline-none"
              aria-expanded={openIndex === index}
              onclick={() => toggleReview(index, item)}
              >{openIndex === index ? 'Cerrar revisión' : 'Revisar fact'}</button
            >{#if openIndex === index}<div class="mt-4 border-t-2 border-blue-700 pt-4">
                <ReviewTray {item} onupdate={(review) => updateReview(index, review)} />
              </div>{/if}
          </article>
        {/each}
      </div>
    {/if}
  </section>
</main>
