import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const repoRoot = path.resolve(import.meta.dirname, '..', '..');
const readPage = (relative) =>
  readFileSync(path.join(repoRoot, relative), 'utf-8');

describe('reserve page booking-window helper text', () => {
  it('en-US reserve.html announces the 4-month window that validation enforces', () => {
    const html = readPage('en-US/reserve.html');
    expect(html).not.toMatch(/within 3 months/i);
    expect(html).toMatch(/within 4 months/i);
  });

  it('ja reserve.html announces the 4ヶ月 window that validation enforces', () => {
    const html = readPage('ja/reserve.html');
    expect(html).not.toMatch(/3ヶ月以内/);
    expect(html).toMatch(/4ヶ月以内/);
  });
});
