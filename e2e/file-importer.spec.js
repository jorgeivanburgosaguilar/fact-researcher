import { expect, test } from '@playwright/test';
import { selectFile } from './fixtures.js';

test('expone controles accesibles y el aviso de privacidad', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('button', { name: 'Seleccionar archivo', exact: true })
  ).toBeVisible();
  await expect(page.getByLabel('Seleccionar archivo result.json')).toBeAttached();
  await expect(page.getByLabel('Privacidad')).toContainText('No se sube a un servidor.');
});

test('rechaza archivos cuyo nombre no es result.json', async ({ page }) => {
  await page.goto('/');
  await selectFile(page, {
    name: 'notas.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{}')
  });

  await expect(page.getByRole('alert')).toContainText(
    'No se pudo importar. Selecciona exactamente un archivo llamado result.json.'
  );
});
