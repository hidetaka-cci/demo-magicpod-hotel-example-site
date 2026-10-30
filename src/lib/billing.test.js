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
      surcharge += Math.round((roomBill * 3 * headCount) / 10);
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
    ).toBe(26000);
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
    expect(total).toBe(72000);
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

// Regression tests documenting the 30% weekend surcharge introduced in PR #7.
// These pin the exact billing amounts the e2e tests must assert.
describe('calcTotalBill - e2e billing scenarios (30% weekend surcharge)', () => {
  // ja locale: お得な特典付きプラン — 7 000¥, 1 guest, 1 night
  it('ja plan-with-special-offers: weekday stay yields 7 000', () => {
    const monday = new Date(2026, 10, 2); // 2026-11-02 Mon
    expect(calcTotalBill(7000, monday, 1, 1, false, false, false, 0)).toBe(7000);
  });

  it('ja plan-with-special-offers: weekend stay yields 9 100 (not 8 750)', () => {
    const saturday = new Date(2026, 10, 7); // 2026-11-07 Sat
    // 7 000 + round(7 000 * 3 * 1 / 10) = 7 000 + 2 100 = 9 100
    expect(calcTotalBill(7000, saturday, 1, 1, false, false, false, 0)).toBe(9100);
  });

  // ja locale: プレミアムプラン — 10 000¥, 4 guests, 2 nights, breakfast + early-check-in (¥1 000 each)
  it('ja premium-plan: weekday stay with breakfast+earlyCheckIn yields 92 000', () => {
    const monday = new Date(2026, 10, 2); // 2026-11-02 Mon  (Mon + Tue: no weekend nights)
    // base: 10 000*4*2=80 000  breakfast: 1 000*4*2=8 000  earlyCheckIn: 1 000*4=4 000
    expect(calcTotalBill(10000, monday, 2, 4, true, true, false, 1000)).toBe(92000);
  });

  it('ja premium-plan: Friday start (1 Sat weekend night) with breakfast+earlyCheckIn yields 104 000 (not 102 000)', () => {
    const friday = new Date(2026, 10, 6); // 2026-11-06 Fri  (nights: Fri + Sat)
    // weekend surcharge: round(10 000*3*4/10)=12 000 for Sat night
    // 80 000 + 12 000 + 12 000 = 104 000
    expect(calcTotalBill(10000, friday, 2, 4, true, true, false, 1000)).toBe(104000);
  });

  it('ja premium-plan: Sunday start (1 Sun weekend night) with breakfast+earlyCheckIn yields 104 000 (not 102 000)', () => {
    const sunday = new Date(2026, 10, 1); // 2026-11-01 Sun  (nights: Sun + Mon)
    // weekend surcharge: round(10 000*3*4/10)=12 000 for Sun night
    // 80 000 + 12 000 + 12 000 = 104 000
    expect(calcTotalBill(10000, sunday, 2, 4, true, true, false, 1000)).toBe(104000);
  });

  it('ja premium-plan: Saturday start (Sat+Sun both weekend) with breakfast+earlyCheckIn yields 116 000 (not 112 000)', () => {
    const saturday = new Date(2026, 10, 7); // 2026-11-07 Sat  (nights: Sat + Sun)
    // weekend surcharge: 12 000 * 2 = 24 000
    // 80 000 + 24 000 + 12 000 = 116 000
    expect(calcTotalBill(10000, saturday, 2, 4, true, true, false, 1000)).toBe(116000);
  });

  // en-US locale: Plan with special offers — $70, 1 guest, 1 night
  it('en-US plan-with-special-offers: weekend stay yields $91.00 (not $87.50)', () => {
    const saturday = new Date(2026, 10, 7); // 2026-11-07 Sat
    // 70 + round(70*3*1/10) = 70 + 21 = 91
    expect(calcTotalBill(70, saturday, 1, 1, false, false, false, 0)).toBe(91);
  });

  // en-US locale: Premium plan — $100, 4 guests, 2 nights, breakfast + early-check-in ($10 each)
  it('en-US premium-plan: Saturday start with breakfast+earlyCheckIn yields $1 160 (not $1 120)', () => {
    const saturday = new Date(2026, 10, 7); // Sat + Sun: 2 weekend nights
    // base: 100*4*2=800  breakfast: 10*4*2=80  earlyCheckIn: 10*4=40  surcharge: round(100*3*4/10)*2=240
    expect(calcTotalBill(100, saturday, 2, 4, true, true, false, 10)).toBe(1160);
  });

  it('en-US premium-plan: Friday/Sunday start with breakfast+earlyCheckIn yields $1 040 (not $1 020)', () => {
    const friday = new Date(2026, 10, 6); // Fri + Sat: 1 weekend night (Sat)
    // surcharge: round(100*3*4/10)=120
    // 800 + 120 + 120 = 1 040
    expect(calcTotalBill(100, friday, 2, 4, true, true, false, 10)).toBe(1040);
  });
});
