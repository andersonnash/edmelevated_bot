const test = require("node:test");
const assert = require("node:assert/strict");
const {
  calculateVenueIncomeBreakdown,
} = require("../services/venueEngine");

test("shows exactly how each venue income source contributes", () => {
  const breakdown = calculateVenueIncomeBreakdown({
    baseIncome: 150,
    barLevel: 1,
    staffMultiplier: 1.05,
    eventMultiplier: 1.1,
  });

  assert.deepEqual(breakdown, {
    baseHourly: 150,
    barBoostHourly: 22,
    permanentStaffBoostHourly: 9,
    eventBoostHourly: 18,
    hourly: 199,
  });
});

test("income sources sum to the displayed hourly total", () => {
  const breakdown = calculateVenueIncomeBreakdown({
    baseIncome: 500,
    barLevel: 2,
    staffMultiplier: 1.18,
    eventMultiplier: 1,
  });

  assert.equal(
    breakdown.baseHourly +
      breakdown.barBoostHourly +
      breakdown.permanentStaffBoostHourly +
      breakdown.eventBoostHourly,
    breakdown.hourly,
  );
});

test("closed venues display zero income from every source", () => {
  const breakdown = calculateVenueIncomeBreakdown({
    baseIncome: 150,
    barLevel: 3,
    staffMultiplier: 1.2,
    eventMultiplier: 1.5,
    closed: true,
  });

  assert.equal(breakdown.hourly, 0);
  assert.equal(
    Object.values(breakdown).reduce((sum, value) => sum + value, 0),
    0,
  );
});
