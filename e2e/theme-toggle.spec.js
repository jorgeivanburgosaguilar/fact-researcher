import { expect, test } from '@playwright/test';

const THEME_STORAGE_KEY = 'fact-researcher-theme';

test('restaura y aplica temas explícitos', async ({ page }) => {
  await page.addInitScript((key) => localStorage.setItem(key, 'dark'), THEME_STORAGE_KEY);
  await page.goto('/');

  const theme = page.getByLabel('Tema');
  await expect(theme).toHaveValue('dark');
  await expect(page.locator('html')).toHaveClass(/dark/);

  await theme.selectOption('light');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
  await theme.selectOption('dark');
  await expect(page.locator('html')).toHaveClass(/dark/);
});

test('el tema del sistema reacciona a cambios del navegador', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/');
  await page.waitForFunction((key) => localStorage.getItem(key) === 'system', THEME_STORAGE_KEY);
  await page.getByLabel('Tema').selectOption('system');
  await expect(page.locator('html')).not.toHaveClass(/dark/);

  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('sigue funcionando cuando localStorage no está disponible', async ({ page }) => {
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    const nativeGetItem = Storage.prototype.getItem;
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === 'fact-researcher-theme') throw new Error('blocked');
      return nativeGetItem.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === 'fact-researcher-theme') throw new Error('blocked');
      return nativeSetItem.call(this, key, value);
    };
  });
  await page.goto('/');
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(pageErrors).toEqual([]);

  const theme = page.getByLabel('Tema');
  await expect(theme).toHaveValue('system');
  await theme.selectOption('dark');
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(
    await page.evaluate(() => {
      try {
        localStorage.getItem('fact-researcher-theme');
        return 'available';
      } catch {
        return 'blocked';
      }
    })
  ).toBe('blocked');
  expect(pageErrors).toEqual([]);
});
