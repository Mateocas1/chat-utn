import { expect } from '@playwright/test';
import { ensureAuthEnv, requiredEnv, test } from './helpers/testEnv';

test.describe('notification settings smoke', () => {
  const missingAuthEnv = ensureAuthEnv();
  const chatTitle = process.env.E2E_CHAT_TITLE;

  test.skip(missingAuthEnv.length > 0, `Missing env vars: ${missingAuthEnv.join(', ')}`);
  test.skip(!requiredEnv.runNotificationSettings, 'Set E2E_RUN_NOTIFICATION_SETTINGS=1 to run notification settings smoke.');
  test.skip(!chatTitle, 'Missing env var: E2E_CHAT_TITLE');

  test('settings open and close from chat header trigger', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(requiredEnv.email as string);
    await page.getByLabel('Contraseña').fill(requiredEnv.password as string);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole('button', { name: new RegExp(chatTitle as string, 'i') }).first().click();

    await expect(page.getByRole('button', { name: 'Ajustes de notificaciones' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Ajustes de notificaciones' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Ajustes de notificaciones' }).click();
    await expect(page.getByRole('heading', { name: 'Ajustes de notificaciones' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('heading', { name: 'Ajustes de notificaciones' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Ajustes de notificaciones' })).toBeFocused();
  });
});
