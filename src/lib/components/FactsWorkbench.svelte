<script>
  // @ts-nocheck
  import { CONFIDENCE_LEVELS, FACT_TYPES, VERIFICATION_STATUSES } from '$lib/facts/contracts.js';
  import ThemeToggle from './ThemeToggle.svelte';
  let {
    document,
    filename = 'result.json',
    onupdate = () => {},
    ondelete = () => {},
    onexport = () => {}
  } = $props();
  const statusLabel = {
    pending: 'Pendiente',
    verified: 'Verificado',
    not_verified: 'No verificado'
  };
  function change(group, index, changes) {
    onupdate(group, index, changes);
  }
</script>

<main class="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
  <header class="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
    <div class="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
      <div>
        <p class="text-xs font-semibold tracking-[.16em] text-blue-700 uppercase">
          Fact Researcher
        </p>
        <p class="mt-1 font-mono text-sm text-slate-600 dark:text-slate-300">{filename}</p>
      </div>
      <div class="flex items-center gap-4">
        <ThemeToggle /><button
          type="button"
          class="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none"
          onclick={onexport}>Descargar JSON enriquecido</button
        >
      </div>
    </div>
  </header>
  <section class="mx-auto max-w-6xl px-6 py-8" aria-labelledby="facts-title">
    <h1 id="facts-title" class="text-2xl font-semibold">Editar result.json</h1>
    <dl class="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
      {#each Object.entries(document.summary) as [name, value] (name)}<div
          class="border border-slate-300 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
        >
          <dt class="font-mono text-xs text-slate-500">{name}</dt>
          <dd class="mt-1 text-lg font-semibold">{value}</dd>
        </div>{/each}
    </dl>
    {#each [['verbatim_facts', 'Facts textuales'], ['inferred_facts', 'Facts inferidos']] as [group, title] (group)}<section
        class="mt-8"
        aria-labelledby={`${group}-title`}
      >
        <h2 id={`${group}-title`} class="text-lg font-semibold">{title}</h2>
        {#if document[group].length === 0}<p class="mt-3 text-sm text-slate-600">
            No hay facts en este grupo.
          </p>{/if}
        <div class="mt-3 space-y-4">
          {#each document[group] as item, index (`${group}-${index}`)}<article
              class="grid gap-4 border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
            >
              <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <label class="text-sm font-semibold"
                  >ID<input
                    class="mt-1 w-full rounded border p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    type="number"
                    value={item.id}
                    oninput={(e) => change(group, index, { id: Number(e.currentTarget.value) })}
                  /></label
                ><label class="text-sm font-semibold"
                  >Tipo<select
                    class="mt-1 w-full rounded border p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    value={item.type}
                    onchange={(e) => change(group, index, { type: e.currentTarget.value })}
                    >{#each FACT_TYPES as type (type)}<option value={type}>{type}</option
                      >{/each}</select
                  ></label
                ><label class="text-sm font-semibold"
                  >Confianza<select
                    class="mt-1 w-full rounded border p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    value={item.confidence}
                    onchange={(e) => change(group, index, { confidence: e.currentTarget.value })}
                    >{#each CONFIDENCE_LEVELS as confidence (confidence)}<option value={confidence}
                        >{confidence}</option
                      >{/each}</select
                  ></label
                ><label class="text-sm font-semibold"
                  >Verificación<select
                    class="mt-1 w-full rounded border p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    value={item.verification_status}
                    onchange={(e) =>
                      change(group, index, { verification_status: e.currentTarget.value })}
                    >{#each VERIFICATION_STATUSES as status (status)}<option value={status}
                        >{statusLabel[status]}</option
                      >{/each}</select
                  ></label
                >
              </div>
              <label class="text-sm font-semibold"
                >Fact<textarea
                  class="mt-1 min-h-20 w-full rounded border p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  value={item.fact}
                  oninput={(e) => change(group, index, { fact: e.currentTarget.value })}
                ></textarea></label
              ><label class="text-sm font-semibold"
                >Verbatim<textarea
                  class="mt-1 min-h-16 w-full rounded border p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  value={item.verbatim ?? ''}
                  oninput={(e) => change(group, index, { verbatim: e.currentTarget.value || null })}
                ></textarea></label
              >
              <div class="grid gap-3 sm:grid-cols-3">
                <label class="text-sm font-semibold"
                  >Línea<input
                    class="mt-1 w-full rounded border p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    type="number"
                    value={item.position.line}
                    oninput={(e) =>
                      change(group, index, {
                        position: { ...item.position, line: Number(e.currentTarget.value) }
                      })}
                  /></label
                ><label class="text-sm font-semibold"
                  >Columna<input
                    class="mt-1 w-full rounded border p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    type="number"
                    value={item.position.column}
                    oninput={(e) =>
                      change(group, index, {
                        position: { ...item.position, column: Number(e.currentTarget.value) }
                      })}
                  /></label
                ><label class="text-sm font-semibold"
                  >Notas<textarea
                    class="mt-1 min-h-11 w-full rounded border p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    value={item.notes}
                    oninput={(e) => change(group, index, { notes: e.currentTarget.value })}
                  ></textarea></label
                >
              </div>
              <button
                type="button"
                class="justify-self-start rounded border border-red-700 px-3 py-2 text-sm font-semibold text-red-800 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:outline-none dark:text-red-200"
                onclick={() => ondelete(group, index)}>Eliminar fact</button
              >
            </article>{/each}
        </div>
      </section>{/each}
  </section>
</main>
