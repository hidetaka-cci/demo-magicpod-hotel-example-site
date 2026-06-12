import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = resolve(__dirname, '..', '..');

function readReserveHtml(locale) {
  return readFileSync(
    resolve(projectRoot, locale, 'reserve.html'),
    'utf8',
  );
}

describe('reserve.html booking window copy', () => {
  it('en-US help text matches the shouldBeFourMonth validation message', () => {
    const html = readReserveHtml('en-US');
    expect(html).toContain('within 4 months');
    expect(html).not.toContain('within 3 months');
  });

  it('ja help text matches the shouldBeFourMonth validation message', () => {
    const html = readReserveHtml('ja');
    expect(html).toContain('4ヶ月以内');
    expect(html).not.toContain('3ヶ月以内');
  });
});
