import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import enMessages from '../data/en-US/message.json';
import jaMessages from '../data/ja/message.json';

function readReserveHtml(locale) {
  return readFileSync(resolve(process.cwd(), locale, 'reserve.html'), 'utf8');
}

function bookingWindowHelpText(html) {
  const match = html.match(
    /<input[^>]*id="date"[^>]*>\s*<small[^>]*class="[^"]*form-text[^"]*"[^>]*>([^<]+)<\/small>/,
  );
  return match ? match[1].trim() : null;
}

describe('reserve.html booking window help text', () => {
  it('en-US matches the validation error message window (4 months)', () => {
    const helpText = bookingWindowHelpText(readReserveHtml('en-US'));
    expect(helpText).toBeTruthy();
    expect(helpText).toMatch(/4 months/);
    expect(helpText).not.toMatch(/3 months/);
    expect(enMessages.validation.shouldBeFourMonth).toMatch(/4 months/);
  });

  it('ja matches the validation error message window (4ヶ月)', () => {
    const helpText = bookingWindowHelpText(readReserveHtml('ja'));
    expect(helpText).toBeTruthy();
    expect(helpText).toMatch(/4ヶ月/);
    expect(helpText).not.toMatch(/3ヶ月/);
    expect(jaMessages.validation.shouldBeFourMonth).toMatch(/4ヶ月/);
  });
});
