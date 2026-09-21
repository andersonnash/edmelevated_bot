const test = require("node:test");
const assert = require("node:assert/strict");
const {
  venueDepartmentLevelName,
  venueDepartmentBenefitLabel,
  venueDepartmentLevel,
} = require("../services/venueDepartmentRules");

test("gives each early bar program level a player-facing identity", () => {
  assert.equal(venueDepartmentLevelName("bar", 0), "No Bar Program");
  assert.equal(venueDepartmentLevelName("bar", 1), "Beer & Wine Service");
  assert.equal(venueDepartmentLevelName("bar", 2), "Full Bar");
  assert.equal(
    venueDepartmentLevelName("bar", 3),
    "Premium Cocktail Program",
  );
});

test("caps venue departments at their final level", () => {
  assert.equal(venueDepartmentLevel("bar", 8), 3);
  assert.equal(venueDepartmentBenefitLabel("bar", 8), "+45% venue income");
});

test("describes each department benefit with its actual mechanic", () => {
  assert.equal(venueDepartmentBenefitLabel("bar", 2), "+30% venue income");
  assert.equal(
    venueDepartmentBenefitLabel("security", 2),
    "+40% venue capacity",
  );
  assert.equal(
    venueDepartmentBenefitLabel("production", 2),
    "+30% show attendance",
  );
});
