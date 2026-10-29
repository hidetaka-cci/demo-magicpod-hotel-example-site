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

describe('e2e billing scenarios (30% weekend surcharge)', () => {
  // en-US: Plan with special offers (roomBill=$70, additionalPlanPrice=$10)
  it('en-US: 1 night / 1 guest / weekday → $70.00', () => {
    const monday = new Date(2026, 5, 1); // Mon Jun 1 2026
    expect(calcTotalBill(70, monday, 1, 1, false, false, false, 0)).toBe(70);
  });

  it('en-US: 1 night / 1 guest / weekend → $91.00 (not $87.50)', () => {
    const saturday = new Date(2026, 5, 6); // Sat Jun 6 2026
    expect(calcTotalBill(70, saturday, 1, 1, false, false, false, 0)).toBe(91);
  });

  // en-US: Premium plan (roomBill=$100, 4 guests, 2 nights, breakfast+earlyCheckIn, additionalPlanPrice=$10)
  it('en-US: premium / 2 nights / 4 guests / weekday → $920.00', () => {
    const tuesday = new Date(2026, 5, 2); // Tue
    expect(calcTotalBill(100, tuesday, 2, 4, true, true, false, 10)).toBe(920);
  });

  it('en-US: premium / 2 nights / 4 guests / Sat start → $1,160.00 (not $1,120.00)', () => {
    const saturday = new Date(2026, 5, 6); // Sat → Sat+Sun both weekend
    expect(calcTotalBill(100, saturday, 2, 4, true, true, false, 10)).toBe(1160);
  });

  it('en-US: premium / 2 nights / 4 guests / Fri start → $1,040.00 (not $1,020.00)', () => {
    const friday = new Date(2026, 5, 5); // Fri → Sat is weekend
    expect(calcTotalBill(100, friday, 2, 4, true, true, false, 10)).toBe(1040);
  });

  it('en-US: premium / 2 nights / 4 guests / Sun start → $1,040.00 (not $1,020.00)', () => {
    const sunday = new Date(2026, 5, 7); // Sun → Sun is weekend, Mon is not
    expect(calcTotalBill(100, sunday, 2, 4, true, true, false, 10)).toBe(1040);
  });

  // ja: お得な特典付きプラン (roomBill=7000, additionalPlanPrice=1000)
  it('ja: 1泊 / 1名 / 平日 → 7,000円', () => {
    const monday = new Date(2026, 5, 1);
    expect(calcTotalBill(7000, monday, 1, 1, false, false, false, 0)).toBe(7000);
  });

  it('ja: 1泊 / 1名 / 土曜 → 9,100円 (8,750円ではない)', () => {
    const saturday = new Date(2026, 5, 6);
    expect(calcTotalBill(7000, saturday, 1, 1, false, false, false, 0)).toBe(9100);
  });

  // ja: プレミアムプラン (roomBill=10000, 4名, 2泊, 朝食+チェックイン早め, additionalPlanPrice=1000)
  it('ja: premium / 2泊 / 4名 / 平日 → 92,000円', () => {
    const tuesday = new Date(2026, 5, 2);
    expect(calcTotalBill(10000, tuesday, 2, 4, true, true, false, 1000)).toBe(92000);
  });

  it('ja: premium / 2泊 / 4名 / 土曜始まり → 116,000円 (112,000円ではない)', () => {
    const saturday = new Date(2026, 5, 6);
    expect(calcTotalBill(10000, saturday, 2, 4, true, true, false, 1000)).toBe(116000);
  });

  it('ja: premium / 2泊 / 4名 / 金曜始まり → 104,000円 (102,000円ではない)', () => {
    const friday = new Date(2026, 5, 5);
    expect(calcTotalBill(10000, friday, 2, 4, true, true, false, 1000)).toBe(104000);
  });

  it('ja: premium / 2泊 / 4名 / 日曜始まり → 104,000円 (102,000円ではない)', () => {
    const sunday = new Date(2026, 5, 7);
    expect(calcTotalBill(10000, sunday, 2, 4, true, true, false, 1000)).toBe(104000);
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
