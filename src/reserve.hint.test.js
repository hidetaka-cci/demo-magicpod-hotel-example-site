import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import enMessages from '../data/en-US/message.json';
import jaMessages from '../data/ja/message.json';

const readHtml = (relativePath) =>
  readFileSync(resolve(process.cwd(), relativePath), 'utf8');

describe('reserve.html booking-window hint', () => {
  it('en-US hint aligns with shouldBeFourMonth validation copy', () => {
    const html = readHtml('en-US/reserve.html');
    const hintMatch = html.match(
      /<small class="form-text text-muted">([^<]+)<\/small>/,
    );
    expect(hintMatch, 'hint <small> should exist on reserve.html').not.toBeNull();
    const hint = hintMatch[1];
    const validationCopy = enMessages.validation.shouldBeFourMonth;
    const monthWord = validationCopy.match(/within (\d+) months?/)[1];
    expect(hint).toContain(`${monthWord} months`);
    expect(hint).not.toMatch(/within 3 months/);
  });

  it('ja hint aligns with shouldBeFourMonth validation copy', () => {
    const html = readHtml('ja/reserve.html');
    const hintMatch = html.match(
      /<small class="form-text text-muted">([^<]+)<\/small>/,
    );
    expect(hintMatch, 'hint <small> should exist on reserve.html').not.toBeNull();
    const hint = hintMatch[1];
    const validationCopy = jaMessages.validation.shouldBeFourMonth;
    const monthWord = validationCopy.match(/(\d+)ヶ月以内/)[1];
    expect(hint).toContain(`${monthWord}ヶ月`);
    expect(hint).not.toMatch(/3ヶ月以内/);
  });
});
