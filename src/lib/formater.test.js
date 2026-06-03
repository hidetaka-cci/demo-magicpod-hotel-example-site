import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import {
  calendarDateArb,
  isoDateStringArb,
  nonIsoDateStringArb,
} from './test/arbitraries.js';
import { formatDateISO, parseDateISO } from './formater.js';

describe('formatDateISO', () => {
  it('formats date as YYYY-MM-DD with zero padding', () => {
    expect(formatDateISO(new Date(2026, 5, 3))).toBe('2026-06-03');
    expect(formatDateISO(new Date(2026, 0, 9))).toBe('2026-01-09');
  });
});

describe('parseDateISO', () => {
  it('parses valid ISO date strings', () => {
    const date = parseDateISO('2026-06-03');
    expect(date).toEqual(new Date(2026, 5, 3));
  });

  it('returns null for invalid strings', () => {
    expect(parseDateISO('not-a-date')).toBeNull();
    expect(parseDateISO('2026/06/03')).toBeNull();
    expect(parseDateISO('')).toBeNull();
  });
});

describe('formatDateISO / parseDateISO round-trip', () => {
  it('round-trips a calendar date', () => {
    const original = new Date(2026, 11, 31);
    expect(parseDateISO(formatDateISO(original))).toEqual(original);
  });
});

describe('property-based', () => {
  it('round-trips calendar dates', () => {
    fc.assert(
      fc.property(calendarDateArb, (date) => {
        expect(parseDateISO(formatDateISO(date))).toEqual(date);
      }),
      { numRuns: 200 },
    );
  });

  it('formats dates as zero-padded YYYY-MM-DD', () => {
    fc.assert(
      fc.property(calendarDateArb, (date) => {
        expect(formatDateISO(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }),
      { numRuns: 200 },
    );
  });

  it('parses formatted ISO strings back to the same date', () => {
    fc.assert(
      fc.property(isoDateStringArb, (iso) => {
        const parsed = parseDateISO(iso);
        expect(parsed).not.toBeNull();
        expect(formatDateISO(parsed)).toBe(iso);
      }),
      { numRuns: 200 },
    );
  });

  it('returns null for strings that do not match the ISO date pattern', () => {
    fc.assert(
      fc.property(nonIsoDateStringArb, (s) => {
        expect(parseDateISO(s)).toBeNull();
      }),
      { numRuns: 200 },
    );
  });
});
