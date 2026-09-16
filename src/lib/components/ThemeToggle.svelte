<script>
  import { onMount } from 'svelte';
  const STORAGE_KEY = 'fact-researcher-theme';
  /** @type {'system' | 'light' | 'dark'} */ let theme = $state('system');
  /** @param {boolean} dark */ function setDocumentTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
  }
  /** @param {string} value @param {boolean} [persist] */ function applyTheme(
    value,
    persist = true
  ) {
    /** @type {'system' | 'light' | 'dark'} */ const selected =
      value === 'light' || value === 'dark' ? value : 'system';
    theme = selected;
    if (persist) {
      try {
        localStorage.setItem(STORAGE_KEY, selected);
      } catch {
        /* Optional storage. */
      }
    }
    setDocumentTheme(
      selected === 'dark' ||
        (selected === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  }
  onMount(() => {
    let stored = 'system';
    try {
      stored = localStorage.getItem(STORAGE_KEY) || 'system';
    } catch {
      /* Use system preference. */
    }
    applyTheme(stored);
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    /** @param {MediaQueryListEvent} event */ const onChange = (event) => {
      if (theme === 'system') setDocumentTheme(event.matches);
    };
    media.addEventListener?.('change', onChange);
    return () => media.removeEventListener?.('change', onChange);
  });
</script>

<label class="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
  ><span>Tema</span><select
    aria-label="Tema"
    class="min-h-10 rounded-md border-slate-300 bg-white px-2 text-sm focus:border-blue-600 focus:ring-2 focus:ring-blue-600 focus:outline-none dark:border-slate-600 dark:bg-slate-950"
    value={theme}
    onchange={(event) =>
      applyTheme(/** @type {'system' | 'light' | 'dark'} */ (event.currentTarget.value))}
    ><option value="system">Sistema</option><option value="light">Claro</option><option value="dark"
      >Oscuro</option
    ></select
  ></label
>
