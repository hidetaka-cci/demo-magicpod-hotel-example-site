import fc from 'fast-check';
import { formatDateISO } from '../formater.js';

const ISO_DATE_PATTERN = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

export const calendarDateArb = fc
  .record({
    year: fc.integer({ min: 1900, max: 2100 }),
    month: fc.integer({ min: 1, max: 12 }),
    day: fc.integer({ min: 1, max: 28 }),
  })
  .map(({ year, month, day }) => new Date(year, month - 1, day));

export const isoDateStringArb = calendarDateArb.map(formatDateISO);

export const nonIsoDateStringArb = fc
  .string()
  .filter((s) => !ISO_DATE_PATTERN.test(s));

export const billingInputsArb = fc.record({
  roomBill: fc.integer({ min: 1, max: 100_000 }),
  term: fc.integer({ min: 1, max: 14 }),
  headCount: fc.integer({ min: 1, max: 10 }),
  additionalPlanPrice: fc.integer({ min: 0, max: 50_000 }),
  date: calendarDateArb,
  breakfast: fc.boolean(),
  earlyCheckIn: fc.boolean(),
  sightseeing: fc.boolean(),
});
