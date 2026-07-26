const test = require("node:test");
const assert = require("node:assert/strict");

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
