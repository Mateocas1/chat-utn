import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const AUTH_COMPONENT_PATHS = [
  'src/features/auth/components/LoginForm.tsx',
  'src/features/auth/components/RegisterForm.tsx'
];

const FORBIDDEN_CLASS_PATTERNS = [
  /\btext-white\b/,
  /\btext-gray-[0-9]{2,3}\b/,
  /\bbg-gray-[0-9]{2,3}\b/,
  /\bborder-gray-[0-9]{2,3}\b/,
  /\btext-red-[0-9]{2,3}\b/,
  /\bbg-red-[0-9]{2,3}\b/,
  /\bborder-red-[0-9]{2,3}\b/,
  /\b(?:text|bg|border|ring|focus:ring|focus:border)-primary-[0-9]{2,3}\b/
];

describe('auth token style guard', () => {
  it('blocks legacy hardcoded auth color classes in forms', () => {
    const violations: string[] = [];

    for (const relativePath of AUTH_COMPONENT_PATHS) {
      const absolutePath = resolve(process.cwd(), relativePath);
      const source = readFileSync(absolutePath, 'utf8');

      for (const pattern of FORBIDDEN_CLASS_PATTERNS) {
        if (pattern.test(source)) {
          violations.push(`${relativePath}: ${pattern.toString()}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
