import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readHtml = (relativePath) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

describe('reserve.html booking-window hint text', () => {
  it('en-US matches the 4-month policy enforced by validateDateInput', () => {
    const html = readHtml('en-US/reserve.html');
    expect(html).toContain('within 4 months');
    expect(html).not.toContain('within 3 months');
  });

  it('ja matches the 4-month policy enforced by validateDateInput', () => {
    const html = readHtml('ja/reserve.html');
    expect(html).toContain('4ヶ月以内');
    expect(html).not.toContain('3ヶ月以内');
  });
});
