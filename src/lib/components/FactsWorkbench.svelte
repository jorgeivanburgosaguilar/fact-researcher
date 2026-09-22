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

  let selectedKey = $state(null);
  let listEl = $state(null);

  const statusLabel = { pending: 'Pendiente', verified: 'Verificado' };
  const sourceLabel = { verbatim_facts: 'Textual', inferred_facts: 'Inferido' };

  let facts = $derived.by(() => [
    ...document.verbatim_facts.map((fact, index) => ({
      fact,
      index,
      group: 'verbatim_facts',
      key: factKey('verbatim_facts', index)
    })),
    ...document.inferred_facts.map((fact, index) => ({
      fact,
      index,
      group: 'inferred_facts',
      key: factKey('inferred_facts', index)
    }))
  ]);
  let selected = $derived(facts.find((entry) => entry.key === selectedKey) ?? null);

  function factKey(group, index) {
    return `${group}-${index}`;
  }

  function selectFact(key) {
    selectedKey = key;
  }

  /** @param {KeyboardEvent} event */
  function onListKeydown(event) {
    if (facts.length === 0) return;
    const currentIndex = facts.findIndex((entry) => entry.key === selectedKey);
    let nextIndex = currentIndex < 0 ? 0 : currentIndex;
    if (event.key === 'ArrowDown') nextIndex = Math.min(currentIndex + 1, facts.length - 1);
    else if (event.key === 'ArrowUp') nextIndex = Math.max(currentIndex - 1, 0);
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = facts.length - 1;
    else return;
    event.preventDefault();
    selectedKey = facts[nextIndex].key;
  }

  function change(changes) {
    if (!selected) return;
    onupdate(selected.group, selected.index, changes);
  }

  function nullableNumber(value) {
    const normalized = value.trim();
    return normalized === '' ? null : Number(normalized);
  }

  function deleteSelected() {
    if (!selected) return;
    const current = selected;
    const currentListIndex = facts.findIndex((entry) => entry.key === current.key);
    const neighbor = facts[currentListIndex + 1] ?? facts[currentListIndex - 1] ?? null;
    if (neighbor) {
      const index =
        neighbor.group === current.group && neighbor.index > current.index
          ? neighbor.index - 1
          : neighbor.index;
      selectedKey = factKey(neighbor.group, index);
    } else selectedKey = null;
    ondelete(current.group, current.index);
  }

  $effect(() => {
    if (facts.length > 0 && !facts.some((entry) => entry.key === selectedKey)) {
      selectedKey = facts[0].key;
    }
  });

  $effect(() => {
    selectedKey;
    listEl?.querySelector(`[data-fact-key="${selectedKey}"]`)?.scrollIntoView({ block: 'nearest' });
  });
</script>

<main
  class="flex min-h-screen flex-col bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100"
>
  <header
    class="shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
  >
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
      <div>
        <h1 class="text-xl font-semibold">Editar result.json</h1>
        <p class="mt-1 font-mono text-sm text-slate-600 dark:text-slate-300">{filename}</p>
      </div>
      <div class="flex items-center gap-4">
        <ThemeToggle />
        <button
          type="button"
          class="rounded-md bg-blue-700 px-4 py-2 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-slate-900"
          onclick={onexport}>Descargar JSON enriquecido</button
        >
      </div>
    </div>
  </header>

  <section
    class="mx-auto flex min-h-0 w-full max-w-7xl flex-1 px-6 py-6"
    aria-label="Workbench de revisión"
  >
    <div
      class="grid min-h-[38rem] w-full grid-cols-1 overflow-hidden rounded-lg border border-slate-200 bg-white lg:grid-cols-[minmax(0,3fr)_minmax(17rem,2fr)] dark:border-slate-700 dark:bg-slate-900"
    >
      <section
        class="flex min-h-0 min-w-0 flex-col border-b border-slate-200 lg:order-2 lg:border-t-0 lg:border-b-0 lg:border-l dark:border-slate-700"
        aria-labelledby="facts-title"
      >
        <div class="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <h2
            id="facts-title"
            class="text-sm font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-300"
          >
            Facts
          </h2>
        </div>
        <div
          bind:this={listEl}
          role="listbox"
          aria-label="Facts"
          aria-activedescendant={selected ? `fact-${selected.key}` : undefined}
          tabindex="0"
          onkeydown={onListKeydown}
          class="min-h-0 flex-1 overflow-y-auto outline-none"
        >
          {#each facts as entry (entry.key)}
            <button
              id={`fact-${entry.key}`}
              data-fact-key={entry.key}
              type="button"
              role="option"
              aria-selected={entry.key === selectedKey}
              onclick={() => selectFact(entry.key)}
              class="w-full border-b border-slate-100 px-4 py-3 text-left transition-colors dark:border-slate-800 {entry.key ===
              selectedKey
                ? 'bg-blue-50 dark:bg-blue-950/40'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/70'}"
            >
              <span class="flex min-w-0 items-center gap-2 text-xs">
                <span class="font-mono font-semibold text-slate-500 dark:text-slate-400"
                  >#{entry.fact.id}</span
                >
                <span
                  class="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  >{sourceLabel[entry.group]}</span
                >
                <span
                  class="rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-800 dark:bg-blue-950/60 dark:text-blue-200"
                  >{entry.fact.type}</span
                >
                <span class="text-slate-500 dark:text-slate-400">{entry.fact.confidence}</span>
              </span>
              <span
                class="mt-1 line-clamp-2 block text-sm leading-5 text-slate-800 dark:text-slate-200"
                >{entry.fact.fact}</span
              >
            </button>
          {:else}
            <p class="p-5 text-sm text-slate-500 dark:text-slate-400">No hay facts para revisar.</p>
          {/each}
        </div>
      </section>

      <section class="flex min-h-0 min-w-0 flex-col" aria-labelledby="detail-title">
        <div class="border-b border-slate-200 px-5 py-3 dark:border-slate-700">
          <h2
            id="detail-title"
            class="text-sm font-semibold tracking-wide text-slate-600 uppercase dark:text-slate-300"
          >
            Detalle del fact
          </h2>
        </div>
        {#if selected}
          <div class="min-h-0 flex-1 overflow-y-auto p-5">
            <label class="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Notas de investigación
              <textarea
                class="mt-1 min-h-64 w-full rounded border border-slate-300 bg-white p-3 leading-6 font-normal placeholder:text-slate-500 focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-950 dark:placeholder:text-slate-400"
                value={selected.fact.notes}
                placeholder="Añade apuntes, enlaces y contexto de la investigación."
                oninput={(event) => change({ notes: event.currentTarget.value })}
              ></textarea>
            </label>

            <section
              class="mt-6 border-t border-slate-200 pt-5 dark:border-slate-700"
              aria-labelledby="fact-information-title"
            >
              <h3
                id="fact-information-title"
                class="text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Información del fact
              </h3>
              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >ID
                  <output
                    class="mt-1 block rounded border border-slate-200 bg-slate-100 px-3 py-2 font-mono text-sm font-normal text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >{selected.fact.id}</output
                  >
                </label>
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >Estado de verificación
                  <select
                    class="mt-1 w-full rounded border border-slate-300 bg-white p-2 font-normal focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-950"
                    value={selected.fact.verification_status}
                    onchange={(event) => change({ verification_status: event.currentTarget.value })}
                  >
                    {#each VERIFICATION_STATUSES as status (status)}
                      <option value={status}>{statusLabel[status]}</option>
                    {/each}
                  </select>
                </label>
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >Tipo
                  <select
                    class="mt-1 w-full rounded border border-slate-300 bg-white p-2 font-normal focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-950"
                    value={selected.fact.type}
                    onchange={(event) => change({ type: event.currentTarget.value })}
                  >
                    {#each FACT_TYPES as type (type)}<option value={type}>{type}</option>{/each}
                  </select>
                </label>
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >Confianza
                  <select
                    class="mt-1 w-full rounded border border-slate-300 bg-white p-2 font-normal focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-950"
                    value={selected.fact.confidence}
                    onchange={(event) => change({ confidence: event.currentTarget.value })}
                  >
                    {#each CONFIDENCE_LEVELS as confidence (confidence)}<option value={confidence}
                        >{confidence}</option
                      >{/each}
                  </select>
                </label>
              </div>

              <label class="mt-4 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >Fact
                <textarea
                  class="mt-1 min-h-28 w-full rounded border border-slate-300 bg-white p-2 leading-6 font-normal focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-950"
                  value={selected.fact.fact}
                  oninput={(event) => change({ fact: event.currentTarget.value })}
                ></textarea>
              </label>
              <label class="mt-4 block text-sm font-semibold text-slate-700 dark:text-slate-200"
                >Verbatim
                <textarea
                  class="mt-1 min-h-24 w-full rounded border border-slate-300 bg-white p-2 leading-6 font-normal focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-950"
                  value={selected.fact.verbatim ?? ''}
                  oninput={(event) => change({ verbatim: event.currentTarget.value || null })}
                ></textarea>
              </label>

              <div class="mt-4 grid gap-4 sm:grid-cols-2">
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >Línea
                  <input
                    class="mt-1 w-full rounded border border-slate-300 bg-white p-2 font-normal focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-950"
                    type="number"
                    value={selected.fact.position.line ?? ''}
                    oninput={(event) =>
                      change({
                        position: {
                          ...selected.fact.position,
                          line: nullableNumber(event.currentTarget.value)
                        }
                      })}
                  />
                </label>
                <label class="text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >Columna
                  <input
                    class="mt-1 w-full rounded border border-slate-300 bg-white p-2 font-normal focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-950"
                    type="number"
                    value={selected.fact.position.column ?? ''}
                    oninput={(event) =>
                      change({
                        position: {
                          ...selected.fact.position,
                          column: nullableNumber(event.currentTarget.value)
                        }
                      })}
                  />
                </label>
              </div>
            </section>

            <button
              type="button"
              class="mt-5 rounded border border-red-700 px-3 py-2 text-sm font-semibold text-red-800 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:outline-none dark:text-red-200"
              onclick={deleteSelected}>Eliminar fact</button
            >
          </div>
        {:else}
          <p class="p-5 text-sm text-slate-500 dark:text-slate-400">
            Selecciona un fact para ver y editar sus detalles.
          </p>
        {/if}
      </section>
    </div>
  </section>
</main>
