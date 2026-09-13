import { describe, expect, it, vi } from 'vitest';
import enMessage from '../../data/en-US/message.json';
import jaMessage from '../../data/ja/message.json';
import { calcTotalBill } from './billing.js';
import { validateDateInput } from './validation.js';

// These assertions mirror the MagicPod scenarios and the Playwright
// specs under e2e/**/reserve.spec.ts. Any regression here means the
// post-deploy MagicPod run against staging will fail.
describe('E2E contract with Playwright and MagicPod', () => {
  describe('weekend surcharge (25%)', () => {
    it('single guest Saturday one-night stay totals 8750', () => {
      const saturday = new Date(2020, 2, 7);
      expect(calcTotalBill(7000, saturday, 1, 1, false, false, false, 0)).toBe(
        8750,
      );
    });

    it('advertises 25% weekend surcharge in Japanese plan descriptions', () => {
      expect(jaMessage.reserve.planDescShort).toContain('25%');
      expect(jaMessage.reserve.planDescLong).toContain('25%');
    });

    it('advertises 25% weekend surcharge in English plan descriptions', () => {
      expect(enMessage.reserve.planDescShort).toContain('25%');
      expect(enMessage.reserve.planDescLong).toContain('25%');
    });
  });

  describe('booking window (within 3 months / 90 days)', () => {
    it('en-US: rejects a date 91 days out with the "within 3 months" copy', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 5, 5, 12, 0, 0));
      document.documentElement.lang = 'en-US';
      const after91 = new Date(2026, 5, 5, 12, 0, 0);
      after91.setDate(after91.getDate() + 91);
      expect(validateDateInput(after91)).toBe(
        'Please enter a date within 3 months.',
      );
      vi.useRealTimers();
    });

    it('ja: rejects a date 91 days out with the "3ヶ月以内" copy', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2026, 5, 5, 12, 0, 0));
      document.documentElement.lang = 'ja';
      const after91 = new Date(2026, 5, 5, 12, 0, 0);
      after91.setDate(after91.getDate() + 91);
      expect(validateDateInput(after91)).toBe(
        '3ヶ月以内の日付を入力してください。',
      );
      vi.useRealTimers();
    });
  });

  describe('valueMissing copy', () => {
    it('en-US validation.valueMissing is "Please fill out this field."', () => {
      expect(enMessage.validation.valueMissing).toBe(
        'Please fill out this field.',
      );
    });

    it('ja validation.valueMissing is "このフィールドを入力してください。"', () => {
      expect(jaMessage.validation.valueMissing).toBe(
        'このフィールドを入力してください。',
      );
    });
  });
});
