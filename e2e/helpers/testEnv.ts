import { test as base } from '@playwright/test';

export const requiredEnv = {
  email: process.env.E2E_EMAIL,
  password: process.env.E2E_PASSWORD,
  displayNamePrefix: process.env.E2E_DISPLAY_NAME_PREFIX ?? 'pw-user',
  secondaryDisplayName: process.env.E2E_SECONDARY_DISPLAY_NAME,
  runRegister: process.env.E2E_RUN_REGISTER === '1',
  runCreateChat: process.env.E2E_RUN_CREATE_CHAT === '1',
  runNotificationSettings: process.env.E2E_RUN_NOTIFICATION_SETTINGS === '1'
};

export const test = base;

export const uniqueSuffix = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const uniqueEmail = () => {
  const suffix = uniqueSuffix();
  return `pw-${suffix}@example.com`;
};

export const uniqueDisplayName = () => `${requiredEnv.displayNamePrefix}-${uniqueSuffix()}`;

export const ensureAuthEnv = () => {
  const missing: string[] = [];
  if (!requiredEnv.email) {
    missing.push('E2E_EMAIL');
  }
  if (!requiredEnv.password) {
    missing.push('E2E_PASSWORD');
  }
  return missing;
};
