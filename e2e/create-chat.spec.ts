import { expect } from '@playwright/test';
import { ensureAuthEnv, requiredEnv, test } from './helpers/testEnv';

test.describe('create chat smoke', () => {
  const missingAuthEnv = ensureAuthEnv();

  test.skip(missingAuthEnv.length > 0, `Missing env vars: ${missingAuthEnv.join(', ')}`);
  test.skip(!requiredEnv.runCreateChat, 'Set E2E_RUN_CREATE_CHAT=1 and E2E_SECONDARY_DISPLAY_NAME to run create-chat smoke.');
  test.skip(!requiredEnv.secondaryDisplayName, 'Missing env var: E2E_SECONDARY_DISPLAY_NAME');

  test('new chat excludes current user and can start with another user', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(requiredEnv.email as string);
    await page.getByLabel('Contraseña').fill(requiredEnv.password as string);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/$/);

    await page.getByRole('button', { name: 'Nuevo chat' }).click();
    await expect(page.getByRole('heading', { name: 'Crear nuevo chat' })).toBeVisible();

    await expect(page.getByRole('button', { name: requiredEnv.secondaryDisplayName as string })).toBeVisible();

    const currentUserName = (await page.locator('header h1').first().innerText()).trim();
    await expect(page.getByRole('button', { name: currentUserName })).toHaveCount(0);

    await page.getByRole('button', { name: requiredEnv.secondaryDisplayName as string }).first().click();

    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});
