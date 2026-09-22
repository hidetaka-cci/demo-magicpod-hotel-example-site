import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, '..');

const readHtml = (relativePath) =>
  readFileSync(resolve(repoRoot, relativePath), 'utf8');

describe('reserve page booking-window copy', () => {
  it('en-US reserve.html advertises the 4-month booking window', () => {
    const html = readHtml('en-US/reserve.html');
    expect(html).toContain('within 4 months');
    expect(html).not.toContain('within 3 months');
  });

  it('ja reserve.html advertises the 4-month booking window', () => {
    const html = readHtml('ja/reserve.html');
    expect(html).toContain('4ヶ月以内');
    expect(html).not.toContain('3ヶ月以内');
  });
});
