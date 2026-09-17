import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import FactsWorkbench from './FactsWorkbench.svelte';

const document = {
  summary: { total: 2, verbatim: 1, inferred: 1, failed_citations: 0, unlocated: 0 },
  verbatim_facts: [
    {
      id: 1,
      fact: 'Fact textual',
      type: 'quote',
      confidence: 'high',
      verbatim: 'Cita',
      position: { line: 2, column: 1 },
      notes: '',
      verification_status: 'pending'
    }
  ],
  inferred_facts: [
    {
      id: 2,
      fact: 'Fact inferido',
      type: 'causal',
      confidence: 'medium',
      verbatim: null,
      position: { line: null, column: null },
      notes: '',
      verification_status: 'pending'
    }
  ]
};

test('selecciona un fact de la lista y actualiza sus notas y estado', async () => {
  const onupdate = vi.fn();
  const screen = await render(FactsWorkbench, { document, onupdate });

  await screen.getByRole('option', { name: /Fact inferido/ }).click();
  await expect.element(screen.getByLabelText('ID')).toHaveTextContent('2');

  await screen.getByLabelText('Notas de investigación').fill('Fuente: https://example.test');
  expect(onupdate).toHaveBeenLastCalledWith('inferred_facts', 0, {
    notes: 'Fuente: https://example.test'
  });

  await screen.getByLabelText('Estado de verificación').selectOptions('verified');
  expect(onupdate).toHaveBeenLastCalledWith('inferred_facts', 0, {
    verification_status: 'verified'
  });
});
