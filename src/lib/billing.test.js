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

// These tests pin the exact billing amounts used in E2E/MagicPod scenarios.
// Keep them in sync with e2e/*/reserve.spec.ts expectations.
describe('E2E scenario billing', () => {
  // en-US "Plan with special offers": roomBill=$70, 1 guest, 1 night, no add-ons
  it('en-US not-logged-in: weekday stay', () => {
    const wednesday = new Date(2026, 5, 3); // Wed
    expect(calcTotalBill(70, wednesday, 1, 1, false, false, false, 0)).toBe(70);
  });

  it('en-US not-logged-in: weekend stay (Saturday)', () => {
    const saturday = new Date(2026, 5, 6); // Sat
    // 30% surcharge: Math.round(70*3*1/10) = 21 → 70+21 = 91
    expect(calcTotalBill(70, saturday, 1, 1, false, false, false, 0)).toBe(91);
  });

  it('en-US not-logged-in: weekend stay (Sunday)', () => {
    const sunday = new Date(2026, 5, 7); // Sun
    expect(calcTotalBill(70, sunday, 1, 1, false, false, false, 0)).toBe(91);
  });

  // en-US "Premium plan": roomBill=$100, 4 guests, 2 nights, breakfast+earlyCheckIn, additionalPlanPrice=$10
  it('en-US logged-in: weekday check-in', () => {
    const wednesday = new Date(2026, 5, 3); // Wed→Thu
    // base=800, breakfast=80, earlyCheckIn=40 → 920
    expect(calcTotalBill(100, wednesday, 2, 4, true, true, false, 10)).toBe(920);
  });

  it('en-US logged-in: Friday check-in (1 weekend night)', () => {
    const friday = new Date(2026, 5, 5); // Fri→Sat
    // base=800, surcharge=120(Sat), breakfast=80, earlyCheckIn=40 → 1040
    expect(calcTotalBill(100, friday, 2, 4, true, true, false, 10)).toBe(1040);
  });

  it('en-US logged-in: Sunday check-in (1 weekend night)', () => {
    const sunday = new Date(2026, 5, 7); // Sun→Mon
    // base=800, surcharge=120(Sun), breakfast=80, earlyCheckIn=40 → 1040
    expect(calcTotalBill(100, sunday, 2, 4, true, true, false, 10)).toBe(1040);
  });

  it('en-US logged-in: Saturday check-in (2 weekend nights)', () => {
    const saturday = new Date(2026, 5, 6); // Sat→Sun
    // base=800, surcharge=120+120=240(Sat+Sun), breakfast=80, earlyCheckIn=40 → 1160
    expect(calcTotalBill(100, saturday, 2, 4, true, true, false, 10)).toBe(1160);
  });

  // ja "お得な特典付きプラン": roomBill=7000, 1 guest, 1 night, no add-ons
  it('ja not-logged-in: weekday stay', () => {
    const wednesday = new Date(2026, 5, 3);
    expect(calcTotalBill(7000, wednesday, 1, 1, false, false, false, 0)).toBe(7000);
  });

  it('ja not-logged-in: weekend stay (Saturday)', () => {
    const saturday = new Date(2026, 5, 6);
    // 30% surcharge: Math.round(7000*3*1/10) = 2100 → 9100
    expect(calcTotalBill(7000, saturday, 1, 1, false, false, false, 0)).toBe(9100);
  });

  // ja "プレミアムプラン": roomBill=10000, 4 guests, 2 nights, breakfast+earlyCheckIn, additionalPlanPrice=1000
  it('ja logged-in: weekday check-in', () => {
    const wednesday = new Date(2026, 5, 3);
    // base=80000, breakfast=8000, earlyCheckIn=4000 → 92000
    expect(calcTotalBill(10000, wednesday, 2, 4, true, true, false, 1000)).toBe(92000);
  });

  it('ja logged-in: Friday check-in (1 weekend night)', () => {
    const friday = new Date(2026, 5, 5);
    // base=80000, surcharge=12000(Sat), breakfast=8000, earlyCheckIn=4000 → 104000
    expect(calcTotalBill(10000, friday, 2, 4, true, true, false, 1000)).toBe(104000);
  });

  it('ja logged-in: Sunday check-in (1 weekend night)', () => {
    const sunday = new Date(2026, 5, 7);
    // base=80000, surcharge=12000(Sun), breakfast=8000, earlyCheckIn=4000 → 104000
    expect(calcTotalBill(10000, sunday, 2, 4, true, true, false, 1000)).toBe(104000);
  });

  it('ja logged-in: Saturday check-in (2 weekend nights)', () => {
    const saturday = new Date(2026, 5, 6);
    // base=80000, surcharge=12000+12000=24000(Sat+Sun), breakfast=8000, earlyCheckIn=4000 → 116000
    expect(calcTotalBill(10000, saturday, 2, 4, true, true, false, 1000)).toBe(116000);
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
