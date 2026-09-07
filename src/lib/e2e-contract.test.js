import { describe, expect, it } from 'vitest';
import enMessage from '../../data/en-US/message.json';
import jaMessage from '../../data/ja/message.json';
import { calcTotalBill } from './billing.js';

describe('E2E contract with Playwright and MagicPod', () => {
  it('single guest Saturday one-night stay totals 8750 (25% weekend surcharge)', () => {
    const saturday = new Date(2020, 2, 7);
    expect(calcTotalBill(7000, saturday, 1, 1, false, false, false, 0)).toBe(8750);
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
