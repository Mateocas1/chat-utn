import { expect } from '@playwright/test';
import { ensureAuthEnv, requiredEnv, test } from './helpers/testEnv';

test.describe('hard refresh session smoke', () => {
  const missingAuthEnv = ensureAuthEnv();
  const chatTitle = process.env.E2E_CHAT_TITLE;

  test.skip(missingAuthEnv.length > 0, `Missing env vars: ${missingAuthEnv.join(', ')}`);

  test('authenticated shell recovers after reload', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(requiredEnv.email as string);
    await page.getByLabel('Contraseña').fill(requiredEnv.password as string);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Mis Chats' })).toBeVisible();

    if (chatTitle) {
      const chatButton = page.getByRole('button', { name: new RegExp(chatTitle, 'i') }).first();
      if ((await chatButton.count()) > 0) {
        await chatButton.click();
      }
    }

    await page.reload({ waitUntil: 'networkidle' });

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Mis Chats' })).toBeVisible();

    if (chatTitle) {
      const chatButton = page.getByRole('button', { name: new RegExp(chatTitle, 'i') }).first();
      if ((await chatButton.count()) > 0) {
        await expect(chatButton).toBeVisible();
      }
    }
  });
});
