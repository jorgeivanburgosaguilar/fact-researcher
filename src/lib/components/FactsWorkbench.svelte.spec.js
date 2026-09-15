import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FactsWorkbench from './FactsWorkbench.svelte';

/** @type {import('$lib/facts/contracts.js').ReviewedFact[]} */
const facts = [
  {
    id: 1,
    fact: 'El informe fue publicado en 2024.',
    type: 'event',
    confidence: 'high',
    verbatim: 'El informe anual se publicó el 2 de enero de 2024.',
    human_review: { status: 'pending', notes: '', corrected_fact: null }
  },
  {
    id: 2,
    fact: 'La organización tiene 12 sedes.',
    type: 'numeric',
    confidence: 'medium',
    verbatim: 'Doce sedes operativas.',
    human_review: { status: 'verified', notes: 'Confirmado', corrected_fact: null }
  }
];

test('ofrece filtros etiquetados, resultado anunciado y progreso textual además del color', async () => {
  const screen = await render(FactsWorkbench, { facts });

  await expect.element(screen.getByLabelText('Buscar')).toBeVisible();
  await expect.element(screen.getByLabelText('Estado')).toBeVisible();
  await expect.element(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  await expect.element(screen.getByRole('progressbar')).toHaveAttribute('aria-valuemax', '2');
  await expect.element(screen.getByText('1 pendiente')).toBeVisible();
  await expect.element(screen.getByText('Verídico').last()).toBeVisible();

  await screen.getByLabelText('Buscar').fill('organización');
  await expect.element(screen.getByText('Mostrando 1 de 2 facts.')).toBeVisible();
  await expect.element(screen.getByText('La organización tiene 12 sedes.').first()).toBeVisible();
});

test('abre la revisión y conserva controles de decisión etiquetados', async () => {
  const onreview = vi.fn();
  const screen = await render(FactsWorkbench, { facts, onreview });

  const reviewButton = screen.getByRole('button', { name: 'Revisar' }).first();
  await reviewButton.click();

  await expect.element(screen.getByText('Registrar revisión').first()).toBeVisible();
  await expect.element(screen.getByLabelText('Decisión').first()).toBeVisible();
  await expect.element(screen.getByLabelText('Notas').first()).toBeVisible();
  await expect.element(screen.getByLabelText('Corrección propuesta').first()).toBeVisible();
  expect(onreview).toHaveBeenCalledWith(0, facts[0].human_review);
});
