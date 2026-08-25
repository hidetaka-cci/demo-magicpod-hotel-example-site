import {describe, expect, it} from 'vitest';
import {calcTotalBill} from './billing.js';

// Locks in the totals that e2e/**/reserve.spec.ts assert on the confirm screen,
// so drift between billing.js and the specs surfaces here without a browser.

const currencyEn = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'});
const currencyJa = new Intl.NumberFormat('ja-JP', {maximumFractionDigits: 0});

const SATURDAY = new Date(2026, 5, 6);
const FRIDAY = new Date(2026, 5, 5);
const WEDNESDAY = new Date(2026, 5, 3);

describe('reserve.spec.ts en-US scenarios', () => {
  it('Plan with special offers, weekend, 1 guest 1 night', () => {
    const total = calcTotalBill(70, SATURDAY, 1, 1, false, false, false, 10);
    expect(`Total ${currencyEn.format(total)} (included taxes)`).toBe(
      'Total $91.00 (included taxes)',
    );
  });

  it('Plan with special offers, weekday, 1 guest 1 night', () => {
    const total = calcTotalBill(70, WEDNESDAY, 1, 1, false, false, false, 10);
    expect(`Total ${currencyEn.format(total)} (included taxes)`).toBe(
      'Total $70.00 (included taxes)',
    );
  });

  it('Premium plan 2 nights 4 guests, breakfast + early check-in, weekend permutations', () => {
    const twoWeekend = calcTotalBill(100, SATURDAY, 2, 4, true, true, false, 10);
    const oneWeekend = calcTotalBill(100, FRIDAY, 2, 4, true, true, false, 10);
    const zeroWeekend = calcTotalBill(100, WEDNESDAY, 2, 4, true, true, false, 10);
    expect(`Total ${currencyEn.format(twoWeekend)} (included taxes)`).toBe(
      'Total $1,160.00 (included taxes)',
    );
    expect(`Total ${currencyEn.format(oneWeekend)} (included taxes)`).toBe(
      'Total $1,040.00 (included taxes)',
    );
    expect(`Total ${currencyEn.format(zeroWeekend)} (included taxes)`).toBe(
      'Total $920.00 (included taxes)',
    );
  });
});

describe('reserve.spec.ts ja scenarios', () => {
  it('お得な特典付きプラン 週末 1名1泊', () => {
    const total = calcTotalBill(7000, SATURDAY, 1, 1, false, false, false, 1000);
    expect(`合計 ${currencyJa.format(total)}円（税込み）`).toBe('合計 9,100円（税込み）');
  });

  it('お得な特典付きプラン 平日 1名1泊', () => {
    const total = calcTotalBill(7000, WEDNESDAY, 1, 1, false, false, false, 1000);
    expect(`合計 ${currencyJa.format(total)}円（税込み）`).toBe('合計 7,000円（税込み）');
  });

  it('プレミアムプラン 2泊4名 朝食＋昼CI 週末パターン', () => {
    const twoWeekend = calcTotalBill(10000, SATURDAY, 2, 4, true, true, false, 1000);
    const oneWeekend = calcTotalBill(10000, FRIDAY, 2, 4, true, true, false, 1000);
    const zeroWeekend = calcTotalBill(10000, WEDNESDAY, 2, 4, true, true, false, 1000);
    expect(`合計 ${currencyJa.format(twoWeekend)}円（税込み）`).toBe('合計 116,000円（税込み）');
    expect(`合計 ${currencyJa.format(oneWeekend)}円（税込み）`).toBe('合計 104,000円（税込み）');
    expect(`合計 ${currencyJa.format(zeroWeekend)}円（税込み）`).toBe('合計 92,000円（税込み）');
  });
});
