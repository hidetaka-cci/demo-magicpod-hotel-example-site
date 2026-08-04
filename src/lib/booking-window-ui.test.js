import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import enMessages from '../../data/en-US/message.json';
import jaMessages from '../../data/ja/message.json';

function readPage(relative) {
  return readFileSync(resolve(process.cwd(), relative), 'utf8');
}

describe('reserve page booking window hint', () => {
  it('en-US reserve.html hint agrees with the validation message', () => {
    const html = readPage('en-US/reserve.html');
    expect(html).toContain('within 4 months');
    expect(html).not.toContain('within 3 months');
    expect(enMessages.validation.shouldBeFourMonth).toContain('4 months');
  });

  it('ja reserve.html hint agrees with the validation message', () => {
    const html = readPage('ja/reserve.html');
    expect(html).toContain('4ヶ月以内');
    expect(html).not.toContain('3ヶ月以内');
    expect(jaMessages.validation.shouldBeFourMonth).toContain('4ヶ月');
  });
});
