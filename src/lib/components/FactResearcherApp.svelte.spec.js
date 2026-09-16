import { afterEach, expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FactResearcherApp from './FactResearcherApp.svelte';
import { DRAFT_STORAGE_KEY } from '$lib/facts/draft-storage.js';

afterEach(() => {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
  document.documentElement.classList.remove('dark');
  vi.restoreAllMocks();
});

test('importa, guarda notas y estado incorrecto, y restaura el borrador', async () => {
  const first = await render(FactResearcherApp);
  const file = new File(
    [
      JSON.stringify({
        facts: [
          {
            id: 7,
            fact: 'El archivo contiene una afirmación.',
            type: 'definition',
            confidence: 'high',
            verbatim: null
          }
        ]
      })
    ],
    'notas.json',
    { type: 'application/json' }
  );
  await first.getByLabelText('Seleccionar archivo JSON').upload(file);

  await expect.element(first.getByText('El archivo contiene una afirmación.')).toBeVisible();
  await first.getByLabelText('Estado').selectOptions('rejected');
  await first.getByLabelText('Notas').fill('La fuente contradice esta afirmación.');
  const stored = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) ?? 'null');
  expect(stored.originalFilename).toBe('notas.json');
  expect(stored.document.facts[0].human_review).toEqual({
    status: 'rejected',
    notes: 'La fuente contradice esta afirmación.',
    corrected_fact: null
  });

  first.unmount();
  const restored = await render(FactResearcherApp);
  await expect.element(restored.getByText('Hay una revisión guardada')).toBeVisible();
  await restored.getByRole('button', { name: 'Restaurar revisión' }).click();
  await expect.element(restored.getByLabelText('Estado')).toHaveValue('rejected');
  await expect
    .element(restored.getByLabelText('Notas'))
    .toHaveValue('La fuente contradice esta afirmación.');
});

test('confirma exportación cuando aún hay facts sin verificar', async () => {
  const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
  const screen = await render(FactResearcherApp);
  const file = new File(
    [
      JSON.stringify({
        facts: [{ id: 1, fact: 'Pendiente', type: 'other', confidence: 'low', verbatim: null }]
      })
    ],
    'pendiente.json',
    { type: 'application/json' }
  );
  await screen.getByLabelText('Seleccionar archivo JSON').upload(file);
  await screen.getByRole('button', { name: 'Exportar JSON' }).click();
  expect(confirm).toHaveBeenCalled();
});
