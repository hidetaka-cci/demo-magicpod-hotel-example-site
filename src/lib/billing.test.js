import { describe, expect, it } from 'vitest';
import { calcTotalBill } from './billing.js';

describe('calcTotalBill', () => {
  const roomBill = 10000;
  const headCount = 2;
  const additionalPlanPrice = 1000;

  it('calculates weekday-only stay without add-ons', () => {
    // 2026-06-03 is Wednesday
    const date = new Date(2026, 5, 3);
    expect(
      calcTotalBill(roomBill, date, 1, headCount, false, false, false, 0),
    ).toBe(20000);
  });

  it('applies weekend surcharge per night', () => {
    // Saturday 2026-06-06
    const date = new Date(2026, 5, 6);
    expect(
      calcTotalBill(roomBill, date, 1, headCount, false, false, false, 0),
    ).toBe(25000);
  });

  it('applies weekend surcharge across multiple nights', () => {
    // Fri–Sun: 2026-06-05 (Fri) + 2 nights → Sat has surcharge
    const date = new Date(2026, 5, 5);
    const total = calcTotalBill(
      roomBill,
      date,
      3,
      headCount,
      false,
      false,
      false,
      0,
    );
    // base: 10000 * 2 * 3 = 60000
    // weekend nights: Sat (day 1), Sun (day 2) → 2 * 10000 * 0.25 * 2 = 10000
    expect(total).toBe(70000);
  });

  it('adds breakfast for all nights', () => {
    const date = new Date(2026, 5, 3);
    expect(
      calcTotalBill(
        roomBill,
        date,
        2,
        headCount,
        true,
        false,
        false,
        additionalPlanPrice,
      ),
    ).toBe(44000);
  });

  it('adds early check-in once per head', () => {
    const date = new Date(2026, 5, 3);
    expect(
      calcTotalBill(
        roomBill,
        date,
        1,
        headCount,
        false,
        true,
        false,
        additionalPlanPrice,
      ),
    ).toBe(22000);
  });

  it('adds sightseeing once per head', () => {
    const date = new Date(2026, 5, 3);
    expect(
      calcTotalBill(
        roomBill,
        date,
        1,
        headCount,
        false,
        false,
        true,
        additionalPlanPrice,
      ),
    ).toBe(22000);
  });
});
