import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { pbtOptions } from '../../test/helpers/pbt.js';
import { calendarDateArb } from './test/arbitraries.js';
import {
  getAdditionalPlanPrice,
  getCurrencyFormatter,
  getDateLongFormatter,
  getDateShortFormatter,
  getDateShortParser,
  getLocale,
  getMessages,
  getPresetUsers,
} from './i18n.js';

describe('getLocale', () => {
  it('returns html lang attribute', () => {
    document.documentElement.lang = 'ja';
    expect(getLocale()).toBe('ja');
  });
});

describe('getMessages', () => {
  it('returns messages for explicit locale', () => {
    expect(getMessages('en-US').validation.valueMissing).toBeTruthy();
    expect(getMessages('ja').validation.valueMissing).toBeTruthy();
  });

  it('uses html lang when locale is omitted', () => {
    document.documentElement.lang = 'en-US';
    expect(getMessages().validation.valueMissing).toBe(
      'Please fill out this field.',
    );
  });
});

describe('getPresetUsers', () => {
  it('returns preset users for each locale', () => {
    expect(getPresetUsers('en-US').length).toBeGreaterThan(0);
    expect(getPresetUsers('ja').length).toBeGreaterThan(0);
  });
});

describe('getCurrencyFormatter', () => {
  it('formats currency per locale', () => {
    expect(getCurrencyFormatter('en-US').format(10)).toMatch(/\$10/);
    expect(getCurrencyFormatter('ja').format(1000)).toContain('1,000');
  });
});

describe('getDateLongFormatter', () => {
  it('formats long dates per locale', () => {
    const date = new Date(2026, 5, 3);
    expect(getDateLongFormatter('en-US').format(date)).toContain('2026');
    expect(getDateLongFormatter('ja').format(date)).toContain('2026');
  });
});

describe('getDateShortFormatter and getDateShortParser', () => {
  it('formats and parses en-US short dates', () => {
    const date = new Date(2026, 5, 3);
    const formatted = getDateShortFormatter('en-US')(date);
    expect(formatted).toBe('06/03/2026');
    expect(getDateShortParser('en-US')(formatted)).toEqual(date);
  });

  it('formats and parses ja short dates', () => {
    const date = new Date(2026, 5, 3);
    const formatted = getDateShortFormatter('ja')(date);
    expect(formatted).toBe('2026/06/03');
    expect(getDateShortParser('ja')(formatted)).toEqual(date);
  });

  it('returns null for invalid short date strings', () => {
    expect(getDateShortParser('en-US')('invalid')).toBeNull();
    expect(getDateShortParser('ja')('invalid')).toBeNull();
  });

  it('pads single-digit month and day', () => {
    const date = new Date(2026, 0, 9);
    expect(getDateShortFormatter('en-US')(date)).toBe('01/09/2026');
    expect(getDateShortFormatter('ja')(date)).toBe('2026/01/09');
  });
});

describe('getAdditionalPlanPrice', () => {
  it('returns locale-specific additional plan prices', () => {
    expect(getAdditionalPlanPrice('en-US')).toBe(10);
    expect(getAdditionalPlanPrice('ja')).toBe(1000);
  });
});

describe('property-based', () => {
  it('round-trips en-US short dates', () => {
    fc.assert(
      fc.property(calendarDateArb, (date) => {
        const format = getDateShortFormatter('en-US');
        const parse = getDateShortParser('en-US');
        expect(parse(format(date))).toEqual(date);
      }),
      pbtOptions,
    );
  });

  it('round-trips ja short dates', () => {
    fc.assert(
      fc.property(calendarDateArb, (date) => {
        const format = getDateShortFormatter('ja');
        const parse = getDateShortParser('ja');
        expect(parse(format(date))).toEqual(date);
      }),
      pbtOptions,
    );
  });
});
