import { expect } from '@playwright/test';
import { ensureAuthEnv, requiredEnv, test, uniqueDisplayName, uniqueEmail } from './helpers/testEnv';

test.describe('auth smoke', () => {
  const missingAuthEnv = ensureAuthEnv();

  test.skip(missingAuthEnv.length > 0, `Missing env vars: ${missingAuthEnv.join(', ')}`);

  test('login navigates to authenticated area', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(requiredEnv.email as string);
    await page.getByLabel('Contraseña').fill(requiredEnv.password as string);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { name: 'Mis Chats' })).toBeVisible();
  });

  test('register flow is guarded and uses unique test data', async ({ page }) => {
    test.skip(!requiredEnv.runRegister, 'Set E2E_RUN_REGISTER=1 to run register smoke against live backend.');

    await page.goto('/register');
    await page.getByLabel('Nombre').fill(uniqueDisplayName());
    await page.getByLabel('Email').fill(uniqueEmail());
    await page.getByLabel('Contraseña').fill('Playwright#1234');
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page).toHaveURL(/\/login$/);
  });
});
