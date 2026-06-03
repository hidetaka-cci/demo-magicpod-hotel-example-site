import { describe, expect, it } from 'vitest';
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
