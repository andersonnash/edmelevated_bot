const test = require("node:test");
const assert = require("node:assert/strict");
const {
  ASSIGNMENT_KEYS,
  selectShowStaffAssignment,
  showStaffRole,
} = require("../services/showStaffRules");

test("offers distinct show staff assignments", () => {
  assert.deepEqual(ASSIGNMENT_KEYS, [
    "door_crew",
    "bar_support",
    "stage_crew",
    "guest_services",
    "promo_crew",
  ]);
});

test("selects assignments across the full random range", () => {
  assert.equal(selectShowStaffAssignment(() => 0), "door_crew");
  assert.equal(selectShowStaffAssignment(() => 0.999999), "promo_crew");
});

test("falls back cleanly for historical generic staff records", () => {
  assert.equal(showStaffRole("staff").label, "Show Staff");
  assert.equal(showStaffRole("unknown").label, "Show Staff");
});
