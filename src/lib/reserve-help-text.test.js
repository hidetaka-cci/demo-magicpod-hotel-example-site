import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import messageEnUs from '../../data/en-US/message.json';
import messageJa from '../../data/ja/message.json';

const readHtml = (relativePath) =>
  fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('reserve.html booking window help text', () => {
  it('en-US reserve.html mirrors the extended booking window validation copy', () => {
    const html = readHtml('en-US/reserve.html');
    expect(html).toContain('Reservations can only be made within 4 months.');
    expect(messageEnUs.validation.shouldBeFourMonth).toBe(
      'Please enter a date within 4 months.',
    );
  });

  it('ja reserve.html mirrors the extended booking window validation copy', () => {
    const html = readHtml('ja/reserve.html');
    expect(html).toContain('ご予約は4ヶ月以内の日付のみ可能です。');
    expect(messageJa.validation.shouldBeFourMonth).toBe(
      '4ヶ月以内の日付を入力してください。',
    );
  });
});
