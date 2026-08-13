import { describe, expect, it } from 'vitest';
import { calcTotalBill } from './billing.js';
import messageEnUS from '../../data/en-US/message.json';
import messageJa from '../../data/ja/message.json';

describe('MagicPod / e2e expected values for reserve confirmation', () => {
  const additionalPlanPriceEn = 10.0;
  const additionalPlanPriceJa = 1000;

  const weekend = new Date(2026, 5, 6);
  const weekday = new Date(2026, 5, 3);

  it('en-US: "Plan with special offers" weekday total renders $70.00', () => {
    const total = calcTotalBill(70.0, weekday, 1, 1, false, false, false, 0);
    expect(total.toFixed(2)).toBe('70.00');
  });

  it('en-US: "Plan with special offers" weekend total renders $91.00 (30% surcharge)', () => {
    const total = calcTotalBill(70.0, weekend, 1, 1, false, false, false, 0);
    expect(total.toFixed(2)).toBe('91.00');
  });

  it('en-US: "Premium plan" weekday total renders $920.00', () => {
    const total = calcTotalBill(
      100.0,
      weekday,
      2,
      4,
      true,
      true,
      false,
      additionalPlanPriceEn,
    );
    expect(total.toFixed(2)).toBe('920.00');
  });

  it('en-US: "Premium plan" with one weekend night renders $1,040.00 (30% surcharge)', () => {
    const friday = new Date(2026, 5, 5);
    const total = calcTotalBill(
      100.0,
      friday,
      2,
      4,
      true,
      true,
      false,
      additionalPlanPriceEn,
    );
    expect(total.toFixed(2)).toBe('1040.00');
  });

  it('en-US: "Premium plan" with two weekend nights renders $1,160.00 (30% surcharge)', () => {
    const saturday = new Date(2026, 5, 6);
    const total = calcTotalBill(
      100.0,
      saturday,
      2,
      4,
      true,
      true,
      false,
      additionalPlanPriceEn,
    );
    expect(total.toFixed(2)).toBe('1160.00');
  });

  it('ja: "Plan with special offers" weekend total renders 9,100 yen (30% surcharge)', () => {
    const total = calcTotalBill(7000, weekend, 1, 1, false, false, false, 0);
    expect(total).toBe(9100);
  });

  it('ja: "Premium plan" weekday total renders 92,000 yen', () => {
    const total = calcTotalBill(
      10000,
      weekday,
      2,
      4,
      true,
      true,
      false,
      additionalPlanPriceJa,
    );
    expect(total).toBe(92000);
  });

  it('ja: "Premium plan" with two weekend nights renders 116,000 yen (30% surcharge)', () => {
    const saturday = new Date(2026, 5, 6);
    const total = calcTotalBill(
      10000,
      saturday,
      2,
      4,
      true,
      true,
      false,
      additionalPlanPriceJa,
    );
    expect(total).toBe(116000);
  });

  it('en-US: booking-window overflow message says "within 4 months"', () => {
    expect(messageEnUS.validation.shouldBeFourMonth).toBe(
      'Please enter a date within 4 months.',
    );
  });

  it('ja: booking-window overflow message says "4ヶ月以内"', () => {
    expect(messageJa.validation.shouldBeFourMonth).toBe(
      '4ヶ月以内の日付を入力してください。',
    );
  });
});
