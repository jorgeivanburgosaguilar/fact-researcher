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
    verbatim: 'Publicado en enero.',
    human_review: { status: 'pending', notes: '', corrected_fact: null }
  },
  {
    id: 2,
    fact: 'La organización tiene 12 sedes.',
    type: 'numeric',
    confidence: 'medium',
    verbatim: null,
    human_review: { status: 'verified', notes: 'Confirmado', corrected_fact: null }
  }
];
test('muestra la lista simple con categoría, estado y notas', async () => {
  const screen = await render(FactsWorkbench, { facts });
  await expect.element(screen.getByText('El informe fue publicado en 2024.')).toBeVisible();
  await expect.element(screen.getByText('Categoría:').first()).toBeVisible();
  await expect.element(screen.getByLabelText('Estado').first()).toHaveValue('pending');
  await expect.element(screen.getByLabelText('Notas').first()).toBeVisible();
  await expect.element(screen.getByText('Buscar')).not.toBeInTheDocument();
  await expect.element(screen.getByText('Exportar JSON')).toBeVisible();
});
test('emite cambios de estado y notas sin mostrar corrección propuesta', async () => {
  const onreview = vi.fn();
  const screen = await render(FactsWorkbench, { facts, onreview });
  await screen.getByLabelText('Estado').first().selectOptions('verified');
  expect(onreview).toHaveBeenCalledWith(0, { status: 'verified', notes: '', corrected_fact: null });
  await screen.getByLabelText('Notas').first().fill('Revisado en la fuente.');
  expect(onreview).toHaveBeenLastCalledWith(0, {
    status: 'pending',
    notes: 'Revisado en la fuente.',
    corrected_fact: null
  });
  await expect.element(screen.getByText('Corrección propuesta')).not.toBeInTheDocument();
});
