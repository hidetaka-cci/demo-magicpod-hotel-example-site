import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import enMessages from '../../data/en-US/message.json';
import jaMessages from '../../data/ja/message.json';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

function readReserveHtml(locale) {
  return readFileSync(resolve(projectRoot, locale, 'reserve.html'), 'utf8');
}

describe('reserve.html booking window help text', () => {
  it('en-US reserve.html states the 4-month booking window', () => {
    const html = readReserveHtml('en-US');
    expect(html).toContain('within 4 months');
    expect(html).not.toContain('within 3 months');
    expect(enMessages.validation.shouldBeFourMonth).toContain('4 months');
  });

  it('ja reserve.html states the 4-month booking window', () => {
    const html = readReserveHtml('ja');
    expect(html).toContain('4ヶ月以内');
    expect(html).not.toContain('3ヶ月以内');
    expect(jaMessages.validation.shouldBeFourMonth).toContain('4ヶ月');
  });
});
