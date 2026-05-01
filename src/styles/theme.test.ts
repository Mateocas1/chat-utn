import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import path from 'path';

const themePath = path.resolve(__dirname, 'theme.css');
const indexCssPath = path.resolve(__dirname, '..', 'index.css');

describe('theme tokens', () => {
  it('defines required OKLCH tokens and dark variant', () => {
    const css = readFileSync(themePath, 'utf8');

    expect(css).toContain('@theme');
    expect(css).toMatch(/--color-bg:\s*oklch\(/);
    expect(css).toMatch(/--color-surface:\s*oklch\(/);
    expect(css).toMatch(/--color-border:\s*oklch\(/);
    expect(css).toMatch(/--color-text:\s*oklch\(/);
    expect(css).toMatch(/--color-accent:\s*oklch\(/);
    expect(css).toMatch(/--color-success:\s*oklch\(/);
    expect(css).toMatch(/--radius-md:\s*[0-9.]+rem/);
    expect(css).toContain('@variant dark');
  });

  it('defines outline focus and avoids ring in global styles', () => {
    const css = readFileSync(themePath, 'utf8');
    const indexCss = readFileSync(indexCssPath, 'utf8');

    expect(css).toContain('outline: 2px solid var(--color-accent)');
    expect(css).toContain('outline-offset: 2px');
    expect(indexCss).not.toMatch(/ring-/);
    expect(indexCss).not.toMatch(/focus:ring/);
  });
});
