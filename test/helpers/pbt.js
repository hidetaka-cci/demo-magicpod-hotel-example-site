export const PBT_NUM_RUNS = Number.parseInt(
  process.env.PBT_NUM_RUNS ?? '1200000',
  10,
);

export const pbtOptions = { numRuns: PBT_NUM_RUNS };
