import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const enReserveHtml = readFileSync(
  resolve(process.cwd(), 'en-US/reserve.html'),
  'utf8',
);
const jaReserveHtml = readFileSync(
  resolve(process.cwd(), 'ja/reserve.html'),
  'utf8',
);

describe('reserve page booking-window help text', () => {
  it('en-US matches the 4-month validation window', () => {
    expect(enReserveHtml).toContain(
      'Reservations can only be made within 4 months.',
    );
    expect(enReserveHtml).not.toContain(
      'Reservations can only be made within 3 months.',
    );
  });

  it('ja matches the 4-month validation window', () => {
    expect(jaReserveHtml).toContain('ご予約は4ヶ月以内の日付のみ可能です。');
    expect(jaReserveHtml).not.toContain('ご予約は3ヶ月以内の日付のみ可能です。');
  });
});
