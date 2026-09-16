import { afterEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import ThemeToggle from './ThemeToggle.svelte';

const originalMatchMedia = window.matchMedia;

afterEach(() => {
  vi.restoreAllMocks();
  window.matchMedia = originalMatchMedia;
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('fact-researcher-theme');
});

function mockMedia(matches = false) {
  const listeners = new Set();
  const media = {
    matches,
    addEventListener: vi.fn((_type, listener) => listeners.add(listener)),
    removeEventListener: vi.fn((_type, listener) => listeners.delete(listener)),
    /** @param {boolean} value */
    emit(value) {
      media.matches = value;
      for (const listener of listeners) listener({ matches: value });
    }
  };
  window.matchMedia = /** @type {typeof window.matchMedia} */ (
    /** @type {unknown} */ (vi.fn(() => media))
  );
  return media;
}

test('restaura preferencia guardada y aplica cada tema explícito', async () => {
  localStorage.setItem('fact-researcher-theme', 'dark');
  mockMedia(false);
  const screen = await render(ThemeToggle);
  await expect.element(screen.getByLabelText('Tema')).toHaveValue('dark');
  expect(document.documentElement.classList.contains('dark')).toBe(true);

  await screen.getByLabelText('Tema').selectOptions('light');
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  await screen.getByLabelText('Tema').selectOptions('dark');
  expect(document.documentElement.classList.contains('dark')).toBe(true);
});

test('usa Sistema y reacciona a cambios de matchMedia, con cleanup', async () => {
  const media = mockMedia(false);
  const screen = await render(ThemeToggle);
  await screen.getByLabelText('Tema').selectOptions('system');
  media.emit(true);
  expect(document.documentElement.classList.contains('dark')).toBe(true);
  media.emit(false);
  expect(document.documentElement.classList.contains('dark')).toBe(false);
  expect(media.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
});

test('tolera fallos al leer y escribir localStorage', async () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  mockMedia(true);
  const screen = await render(ThemeToggle);
  await expect.element(screen.getByLabelText('Tema')).toHaveValue('system');
  await screen.getByLabelText('Tema').selectOptions('dark');
  expect(document.documentElement.classList.contains('dark')).toBe(true);
});
