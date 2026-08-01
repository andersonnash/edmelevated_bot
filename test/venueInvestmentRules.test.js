const test = require("node:test");
const assert = require("node:assert/strict");
const { VENUE_TYPES } = require("../constants");

const {
  VENUE_INSURANCE,
  venueInvestmentMultiplier,
  venueInsuranceCost,
  venueDepartmentUpgradeCost,
  venueStaffHiringCost,
} = require("../services/venueInvestmentRules");

test("uses one 48-hour venue insurance policy", () => {
  assert.equal(VENUE_INSURANCE.durationHours, 48);
  assert.equal(VENUE_INSURANCE.incidentReduction, 0.35);
  assert.equal(VENUE_INSURANCE.closureReduction, 0.5);
});

test("scales insurance prices by venue type", () => {
  assert.equal(venueInsuranceCost("garage_party"), 250);
  assert.equal(venueInsuranceCost("warehouse"), 750);
  assert.equal(venueInsuranceCost("underground_club"), 2_000);
  assert.equal(venueInsuranceCost("downtown_venue"), 5_000);
  assert.equal(venueInsuranceCost("festival_grounds"), 15_000);
});

test("scales department upgrades by venue and department level", () => {
  assert.equal(venueDepartmentUpgradeCost("garage_party", "bar", 1), 500);
  assert.equal(venueDepartmentUpgradeCost("warehouse", "security", 1), 2_500);
  assert.equal(
    venueDepartmentUpgradeCost("underground_club", "production", 2),
    20_000,
  );
  assert.equal(
    venueDepartmentUpgradeCost("festival_grounds", "bar", 3),
    30_000,
  );
});

test("scales permanent staff prices by venue type", () => {
  assert.equal(venueInvestmentMultiplier("garage_party"), 0.5);
  assert.equal(venueStaffHiringCost("garage_party", "bartender"), 500);
  assert.equal(venueStaffHiringCost("warehouse", "manager"), 5_000);
  assert.equal(
    venueStaffHiringCost("downtown_venue", "promoter"),
    8_000,
  );
  assert.equal(
    venueStaffHiringCost("festival_grounds", "bouncer"),
    15_000,
  );
});

test("makes the first progression venue stronger than three starter venues", () => {
  const garage = VENUE_TYPES.garage_party;
  const warehouse = VENUE_TYPES.warehouse;

  assert.equal(warehouse.cost, garage.cost * 3);
  assert.ok(warehouse.passiveIncome > garage.passiveIncome * 3);
  assert.ok(warehouse.baseCapacity > garage.baseCapacity * 3);
});

test("keeps the venue progression curve rewarding at every tier", () => {
  const expectedCurve = [
    ["garage_party", 2_500, 150],
    ["warehouse", 7_500, 500],
    ["underground_club", 22_500, 1_500],
    ["downtown_venue", 60_000, 4_000],
    ["festival_grounds", 200_000, 12_000],
  ];

  for (const [venueType, cost, passiveIncome] of expectedCurve) {
    const venue = VENUE_TYPES[venueType];
    assert.equal(venue.cost, cost);
    assert.equal(venue.passiveIncome, passiveIncome);
  }

  for (let index = 1; index < expectedCurve.length; index += 1) {
    const previous = VENUE_TYPES[expectedCurve[index - 1][0]];
    const current = VENUE_TYPES[expectedCurve[index][0]];

    assert.ok(current.cost > previous.cost);
    assert.ok(current.passiveIncome > previous.passiveIncome);
    assert.ok(current.baseCapacity > previous.baseCapacity);
  }
});

test("keeps base venue payback near the intended 15-hour curve", () => {
  const paybackHours = Object.values(VENUE_TYPES).map(
    (venue) => venue.cost / venue.passiveIncome,
  );

  for (const hours of paybackHours) {
    assert.ok(hours >= 15);
    assert.ok(hours <= 17);
  }
});
