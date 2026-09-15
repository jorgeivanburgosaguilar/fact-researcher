<script>
  import { REVIEW_STATUSES } from '$lib/facts/contracts.js';
  /** @typedef {import('$lib/facts/contracts.js').ReviewedFact} ReviewedFact */
  /** @typedef {import('$lib/facts/contracts.js').ReviewStatus} ReviewStatus */
  /** @typedef {{ item: ReviewedFact, onupdate?: (review: ReviewedFact['human_review']) => void }} Props */
  /** @type {Props} */
  let { item, onupdate = () => {} } = $props();
  const statusLabel = { pending: 'Pendiente', verified: 'Verídico', rejected: 'Falso' };
</script>

<fieldset class="grid gap-4 lg:grid-cols-[13rem_1fr_1fr]">
  <legend class="mb-2 text-sm font-semibold">Registrar revisión</legend><label
    class="text-sm font-semibold text-slate-800"
    >Decisión <select
      class="mt-1 block w-full rounded-md border-slate-400 text-sm focus:border-blue-700 focus:ring-blue-700"
      value={item.human_review.status}
      onchange={(event) =>
        onupdate({
          ...item.human_review,
          status: /** @type {ReviewStatus} */ (event.currentTarget.value)
        })}
      >{#each REVIEW_STATUSES as status (status)}<option value={status}
          >{statusLabel[status]}</option
        >{/each}</select
    ></label
  ><label class="text-sm font-semibold text-slate-800"
    >Notas <textarea
      class="mt-1 block min-h-24 w-full rounded-md border-slate-400 text-sm focus:border-blue-700 focus:ring-blue-700"
      value={item.human_review.notes}
      oninput={(event) => onupdate({ ...item.human_review, notes: event.currentTarget.value })}
      placeholder="Razón o fuente de la decisión"
    ></textarea></label
  ><label class="text-sm font-semibold text-slate-800"
    >Corrección propuesta <textarea
      class="mt-1 block min-h-24 w-full rounded-md border-slate-400 text-sm focus:border-blue-700 focus:ring-blue-700"
      value={item.human_review.corrected_fact ?? ''}
      oninput={(event) =>
        onupdate({ ...item.human_review, corrected_fact: event.currentTarget.value || null })}
      placeholder="No altera el fact original"
    ></textarea></label
  >
</fieldset>
