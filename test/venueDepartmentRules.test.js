const test = require("node:test");
const assert = require("node:assert/strict");
const {
  venueDepartmentLevelName,
  venueDepartmentBenefitLabel,
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

test("keeps the premium name available for unlimited later levels", () => {
  assert.equal(
    venueDepartmentLevelName("bar", 8),
    "Premium Cocktail Program",
  );
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
