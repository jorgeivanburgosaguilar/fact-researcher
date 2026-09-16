import { expect, test } from '@playwright/test';

test('revisa una nota, restaura el borrador y exporta confirmando pendientes', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('fact-researcher-theme', 'light'));
  await page.goto('/');
  const theme = page.getByLabel('Tema');
  await expect(theme).toHaveValue('light');
  await theme.selectOption('dark');
  await expect(page.locator('html')).toHaveClass(/dark/);

  const source = {
    facts: [
      {
        id: 7,
        fact: 'El archivo contiene una afirmación.',
        type: 'definition',
        confidence: 'high',
        verbatim: null
      },
      {
        id: 8,
        fact: 'Otro fact aún no revisado.',
        type: 'other',
        confidence: 'low',
        verbatim: null
      }
    ]
  };
  await page.getByLabel('Seleccionar archivo JSON').setInputFiles({
    name: 'notas.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(source))
  });
  await expect(page.getByText('El archivo contiene una afirmación.')).toBeVisible();
  await page.getByLabel('Estado').first().selectOption('rejected');
  await page.getByLabel('Notas').first().fill('La fuente contradice esta afirmación.');
  await page.reload();
  await expect(page.getByText('Hay una revisión guardada')).toBeVisible();
  await page.getByRole('button', { name: 'Restaurar revisión' }).click();
  await expect(page.getByLabel('Estado').first()).toHaveValue('rejected');
  await expect(page.getByLabel('Notas').first()).toHaveValue(
    'La fuente contradice esta afirmación.'
  );
  const downloadPromise = page.waitForEvent('download');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Exportar JSON' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('notas-reviewed.json');
});
