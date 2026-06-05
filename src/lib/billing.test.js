import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import { pbtOptions } from '../../test/helpers/pbt.js';
import { calcTotalBill } from './billing.js';
import { billingInputsArb, calendarDateArb } from './test/arbitraries.js';

function expectedWeekendSurcharge(roomBill, date, term, headCount) {
  let surcharge = 0;
  for (let i = 0; i < term; i++) {
    const night = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    night.setDate(night.getDate() + i);
    if (night.getDay() === 0 || night.getDay() === 6) {
      surcharge += roomBill * 0.25 * headCount;
    }
  }
  return surcharge;
}

describe('calcTotalBill', () => {
  const roomBill = 10000;
  const headCount = 2;
  const additionalPlanPrice = 1000;

  it('calculates weekday-only stay without add-ons', () => {
    const date = new Date(2026, 5, 3);
    expect(
      calcTotalBill(roomBill, date, 1, headCount, false, false, false, 0),
    ).toBe(20000);
  });

  it('applies weekend surcharge per night', () => {
    const date = new Date(2026, 5, 6);
    expect(
      calcTotalBill(roomBill, date, 1, headCount, false, false, false, 0),
    ).toBe(25000);
  });

  it('applies weekend surcharge across multiple nights', () => {
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

describe('property-based', () => {
  it('returns a finite non-negative total for positive inputs', () => {
    fc.assert(
      fc.property(billingInputsArb, (input) => {
        const total = calcTotalBill(
          input.roomBill,
          input.date,
          input.term,
          input.headCount,
          input.breakfast,
          input.earlyCheckIn,
          input.sightseeing,
          input.additionalPlanPrice,
        );
        expect(Number.isFinite(total)).toBe(true);
        expect(total).toBeGreaterThanOrEqual(0);
      }),
      pbtOptions,
    );
  });

  it('is at least the base room charge when add-ons are disabled', () => {
    fc.assert(
      fc.property(billingInputsArb, (input) => {
        const total = calcTotalBill(
          input.roomBill,
          input.date,
          input.term,
          input.headCount,
          false,
          false,
          false,
          0,
        );
        const base = input.roomBill * input.headCount * input.term;
        expect(total).toBeGreaterThanOrEqual(base);
      }),
      pbtOptions,
    );
  });

  it('matches base plus weekend surcharge when add-ons are disabled', () => {
    fc.assert(
      fc.property(billingInputsArb, (input) => {
        const total = calcTotalBill(
          input.roomBill,
          input.date,
          input.term,
          input.headCount,
          false,
          false,
          false,
          0,
        );
        const base = input.roomBill * input.headCount * input.term;
        const weekend = expectedWeekendSurcharge(
          input.roomBill,
          input.date,
          input.term,
          input.headCount,
        );
        expect(total).toBe(base + weekend);
      }),
      pbtOptions,
    );
  });

  it('does not decrease when roomBill increases', () => {
    fc.assert(
      fc.property(
        billingInputsArb,
        fc.integer({ min: 1, max: 50_000 }),
        (input, extraRoomBill) => {
          const args = [
            input.date,
            input.term,
            input.headCount,
            input.breakfast,
            input.earlyCheckIn,
            input.sightseeing,
            input.additionalPlanPrice,
          ];
          const lower = calcTotalBill(input.roomBill, ...args);
          const higher = calcTotalBill(
            input.roomBill + extraRoomBill,
            ...args,
          );
          expect(higher).toBeGreaterThanOrEqual(lower);
        },
      ),
      pbtOptions,
    );
  });

  it('does not decrease when optional plans are enabled', () => {
    fc.assert(
      fc.property(billingInputsArb, (input) => {
        const withoutAddons = calcTotalBill(
          input.roomBill,
          input.date,
          input.term,
          input.headCount,
          false,
          false,
          false,
          input.additionalPlanPrice,
        );
        const withBreakfast = calcTotalBill(
          input.roomBill,
          input.date,
          input.term,
          input.headCount,
          true,
          false,
          false,
          input.additionalPlanPrice,
        );
        const withEarlyCheckIn = calcTotalBill(
          input.roomBill,
          input.date,
          input.term,
          input.headCount,
          false,
          true,
          false,
          input.additionalPlanPrice,
        );
        const withSightseeing = calcTotalBill(
          input.roomBill,
          input.date,
          input.term,
          input.headCount,
          false,
          false,
          true,
          input.additionalPlanPrice,
        );
        expect(withBreakfast).toBeGreaterThanOrEqual(withoutAddons);
        expect(withEarlyCheckIn).toBeGreaterThanOrEqual(withoutAddons);
        expect(withSightseeing).toBeGreaterThanOrEqual(withoutAddons);
      }),
      pbtOptions,
    );
  });

  it('adds breakfast cost proportional to term and head count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 100_000 }),
        calendarDateArb,
        fc.integer({ min: 1, max: 14 }),
        fc.integer({ min: 1, max: 10 }),
        fc.integer({ min: 1, max: 50_000 }),
        (roomBill, date, term, headCount, additionalPlanPrice) => {
          const without = calcTotalBill(
            roomBill,
            date,
            term,
            headCount,
            false,
            false,
            false,
            additionalPlanPrice,
          );
          const withBreakfast = calcTotalBill(
            roomBill,
            date,
            term,
            headCount,
            true,
            false,
            false,
            additionalPlanPrice,
          );
          expect(withBreakfast - without).toBe(
            additionalPlanPrice * headCount * term,
          );
        },
      ),
      pbtOptions,
    );
  });
});
