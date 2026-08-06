const test = require("node:test");
const assert = require("node:assert/strict");
const { VENUE_STAFF_ROLES } = require("../constants");
const {
  summarizeVenueStaff,
} = require("../services/venueStaffDisplayRules");

test("groups duplicate permanent staff roles and totals their boosts", () => {
  const summary = summarizeVenueStaff(
    [
      { role: "manager" },
      { role: "manager" },
      { role: "promoter" },
      { role: "bartender" },
      { role: "bouncer" },
      { role: "manager" },
    ],
    VENUE_STAFF_ROLES,
  );

  assert.equal(summary.totalStaff, 6);
  assert.equal(summary.totalBoostPercent, 83);
  assert.deepEqual(
    summary.groups.map(({ key, quantity, boostPercent }) => ({
      key,
      quantity,
      boostPercent,
    })),
    [
      { key: "manager", quantity: 3, boostPercent: 60 },
      { key: "promoter", quantity: 1, boostPercent: 8 },
      { key: "bartender", quantity: 1, boostPercent: 5 },
      { key: "bouncer", quantity: 1, boostPercent: 10 },
    ],
  );
});

test("keeps historical unknown roles readable", () => {
  const summary = summarizeVenueStaff(
    [{ role: "legacy_role", username: "Alex" }],
    VENUE_STAFF_ROLES,
  );

  assert.equal(summary.groups[0].label, "Alex");
  assert.equal(summary.groups[0].emoji, "👤");
  assert.equal(summary.groups[0].boostPercent, 0);
});
