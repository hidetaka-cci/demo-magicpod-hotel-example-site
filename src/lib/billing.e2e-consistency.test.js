import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { calcTotalBill } from './billing.js';

// Guards the weekend-total string that Playwright/MagicPod assert on the
// reservation confirmation page against what calcTotalBill actually produces.
// A surcharge-rate change that forgets the E2E spec will fail here.
describe('e2e reserve spec weekend totals stay in sync with billing', () => {
  const saturday = new Date(2026, 5, 6); // Sat, 1 night, 1 head, no add-ons.

  it('ja/reserve.spec.ts weekend total matches calcTotalBill(7000)', () => {
    const text = readFileSync(
      resolve(__dirname, '../../e2e/ja/reserve.spec.ts'),
      'utf8',
    );
    const match = text.match(
      /weekend\s*\?\s*'合計 ([\d,]+)円（税込み）'/,
    );
    expect(match, 'weekend total literal not found in ja spec').not.toBeNull();
    const specTotal = Number.parseInt(match[1].replace(/,/g, ''), 10);
    const billingTotal = calcTotalBill(
      7000,
      saturday,
      1,
      1,
      false,
      false,
      false,
      0,
    );
    expect(specTotal).toBe(billingTotal);
  });

  it('en-US/reserve.spec.ts weekend total matches calcTotalBill(70)', () => {
    const text = readFileSync(
      resolve(__dirname, '../../e2e/en-US/reserve.spec.ts'),
      'utf8',
    );
    const match = text.match(
      /weekend\s*\?\s*'Total \$(\d+(?:\.\d+)?) \(included taxes\)'/,
    );
    expect(match, 'weekend total literal not found in en-US spec').not.toBeNull();
    const specTotal = Number.parseFloat(match[1]);
    const billingTotal = calcTotalBill(
      70,
      saturday,
      1,
      1,
      false,
      false,
      false,
      0,
    );
    expect(specTotal).toBe(billingTotal);
  });
});
