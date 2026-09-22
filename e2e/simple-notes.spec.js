import { expect, test } from '@playwright/test';
import { importResultDocument } from './fixtures.js';

const DRAFT_STORAGE_KEY = 'fact-researcher.result-draft.v2';

test('edita un fact, restaura el borrador y descarga el documento enriquecido', async ({
  page
}) => {
  await page.goto('/');
  await importResultDocument(page);

  await expect(page.getByText('Fact textual', { exact: true })).toBeVisible();
  await page.getByRole('option', { name: /Fact inferido/ }).click();
  await expect(page.getByLabel('ID')).toHaveText('2');

  await page.getByLabel('Notas de investigación').fill('Fuente: https://example.test');
  await page.getByLabel('Estado de verificación').selectOption('verified');

  await expect
    .poll(() =>
      page.evaluate((key) => {
        const stored = JSON.parse(localStorage.getItem(key));
        return {
          originalFilename: stored.originalFilename,
          fact: stored.document.inferred_facts[0]
        };
      }, DRAFT_STORAGE_KEY)
    )
    .toEqual({
      originalFilename: 'result.json',
      fact: expect.objectContaining({
        notes: 'Fuente: https://example.test',
        verification_status: 'verified'
      })
    });

  await page.reload();
  await expect(page.getByText('Hay un borrador guardado')).toBeVisible();
  await page.getByRole('button', { name: 'Restaurar borrador' }).click();
  await page.getByRole('option', { name: /Fact inferido/ }).click();
  await expect(page.getByLabel('Notas de investigación')).toHaveValue(
    'Fuente: https://example.test'
  );
  await expect(page.getByLabel('Estado de verificación')).toHaveValue('verified');

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Descargar JSON enriquecido' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('result-enriched.json');
});

test('muestra el detalle antes que Facts y las notas antes de la información editable', async ({
  page
}) => {
  await page.goto('/');
  await importResultDocument(page);

  const detailBox = await page.getByRole('heading', { name: 'Detalle del fact' }).boundingBox();
  const factsBox = await page.getByRole('heading', { name: 'Facts' }).boundingBox();
  const notesBox = await page.getByLabel('Notas de investigación').boundingBox();
  const informationBox = await page
    .getByRole('heading', { name: 'Información del fact' })
    .boundingBox();

  expect(detailBox).not.toBeNull();
  expect(factsBox).not.toBeNull();
  expect(notesBox).not.toBeNull();
  expect(informationBox).not.toBeNull();
  expect(detailBox.x).toBeLessThan(factsBox.x);
  expect(notesBox.y).toBeLessThan(informationBox.y);
});
