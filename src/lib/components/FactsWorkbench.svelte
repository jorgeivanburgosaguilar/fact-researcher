<script>
  import { REVIEW_STATUSES } from '$lib/facts/contracts.js';
  import ThemeToggle from './ThemeToggle.svelte';
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
  const statusLabel = { pending: 'Sin verificar', verified: 'Correcto', rejected: 'Incorrecto' };
  const statusClass = {
    pending:
      'border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100',
    verified:
      'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100',
    rejected:
      'border-red-300 bg-red-50 text-red-950 dark:border-red-700 dark:bg-red-950/40 dark:text-red-100'
  };
  /** @param {number} index @param {Partial<ReviewedFact['human_review']>} changes */
  function updateReview(index, changes) {
    onreview(index, { ...facts[index].human_review, ...changes });
  }
</script>

<main class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
  <header class="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
      <div class="min-w-0">
        <p
          class="text-xs font-semibold tracking-[0.16em] text-blue-700 uppercase dark:text-blue-300"
        >
          Fact Researcher
        </p>
        <p class="mt-1 truncate font-mono text-sm text-slate-600 dark:text-slate-300">{filename}</p>
      </div>
      <div class="flex shrink-0 items-center gap-4">
        <ThemeToggle /><button
          type="button"
          class="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-slate-900"
          onclick={onexport}>Exportar JSON</button
        >
      </div>
    </div>
  </header>
  <section class="mx-auto max-w-6xl px-6 py-8" aria-labelledby="facts-title">
    <div class="mb-6">
      <h1 id="facts-title" class="text-2xl font-semibold tracking-tight">Revisión de facts</h1>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Añade tus notas y marca cada afirmación cuando la hayas revisado.
      </p>
    </div>
    {#if facts.length === 0}<p
        class="border border-slate-300 bg-white p-8 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        No hay facts para revisar.
      </p>{:else}<div class="space-y-4">
        {#each facts as item, index (index)}
          <article
            class={`grid gap-6 border border-l border-slate-200 bg-white p-5 shadow-sm lg:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)] dark:border-slate-700 dark:bg-slate-900 ${item.human_review.status === 'pending' ? 'border-l-amber-500' : item.human_review.status === 'verified' ? 'border-l-emerald-500' : 'border-l-red-500'}`}
          >
            <div class="min-w-0">
              <p class="font-mono text-xs text-slate-500 dark:text-slate-400">ID: {item.id}</p>
              <h2 class="mt-3 text-base leading-7 font-medium">{item.fact}</h2>
            </div>
            <div
              class="grid gap-4 border-t border-slate-200 pt-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 dark:border-slate-700"
            >
              <p class="text-sm">
                <span class="font-semibold">Categoría:</span>
                <span class="font-mono text-slate-600 dark:text-slate-300">{item.type}</span>
              </p>
              <label class="text-sm font-semibold" for={`status-${index}`}
                >Estado<select
                  id={`status-${index}`}
                  class={`mt-1 block min-h-11 w-full rounded-md border px-3 py-2 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none ${statusClass[item.human_review.status]}`}
                  value={item.human_review.status}
                  onchange={(event) =>
                    updateReview(index, {
                      status: /** @type {ReviewStatus} */ (event.currentTarget.value)
                    })}
                  >{#each REVIEW_STATUSES as status (status)}<option value={status}
                      >{statusLabel[status]}</option
                    >{/each}</select
                ></label
              ><label class="text-sm font-semibold" for={`notes-${index}`}
                >Notas<textarea
                  id={`notes-${index}`}
                  class="mt-1 block min-h-28 w-full rounded-md border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-950"
                  value={item.human_review.notes}
                  oninput={(event) => updateReview(index, { notes: event.currentTarget.value })}
                  placeholder="Escribe tus notas…"
                ></textarea></label
              >
            </div>
          </article>
        {/each}
      </div>{/if}
  </section>
</main>
