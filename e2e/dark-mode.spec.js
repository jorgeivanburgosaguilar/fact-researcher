import { expect, test } from '@playwright/test';
import { resultDocument } from './fixtures.js';

const DRAFT_STORAGE_KEY = 'fact-researcher.result-draft.v2';
const THEME_STORAGE_KEY = 'fact-researcher-theme';

test('aplica superficies oscuras al aviso de borrador', async ({ page }) => {
  await page.addInitScript(
    ({ draftKey, document, themeKey }) => {
      localStorage.setItem(themeKey, 'dark');
      localStorage.setItem(draftKey, JSON.stringify({ originalFilename: 'result.json', document }));
    },
    { draftKey: DRAFT_STORAGE_KEY, document: resultDocument, themeKey: THEME_STORAGE_KEY }
  );
  await page.goto('/');

  const draft = page.getByText('Hay un borrador guardado').locator('..');
  await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
  await expect(draft).toHaveClass(/dark:bg-blue-950\/60/);
  await expect(draft).toHaveClass(/dark:text-blue-100/);
});

test('aplica una superficie oscura al aviso de almacenamiento', async ({ page }) => {
  await page.addInitScript(
    ({ draftKey, themeKey }) => {
      localStorage.setItem(themeKey, 'dark');
      const nativeGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = function (key) {
        if (key === draftKey) throw new Error('blocked');
        return nativeGetItem.call(this, key);
      };
    },
    { draftKey: DRAFT_STORAGE_KEY, themeKey: THEME_STORAGE_KEY }
  );
  await page.goto('/');

  const notice = page.getByRole('status');
  await expect(notice).toHaveClass(/dark:bg-amber-950\/60/);
  await expect(notice).toHaveClass(/dark:text-amber-100/);
});
