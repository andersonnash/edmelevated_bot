const assert = require("node:assert/strict");
const {
  WORK_COOLDOWN_MINUTES,
  calculateWorkReward,
  selectWorkScenario,
} = require("../services/workRules");

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

const scenarios = [
  { key: "first", minCash: 50, maxCash: 100, xp: 8, reputation: 0 },
  { key: "second", minCash: 80, maxCash: 120, xp: 12, reputation: 1 },
];

test("uses one shared 45-minute work cooldown", () => {
  assert.equal(WORK_COOLDOWN_MINUTES, 45);
});

test("selects a random work scenario", () => {
  assert.equal(selectWorkScenario(scenarios, () => 0).key, "first");
  assert.equal(selectWorkScenario(scenarios, () => 0.999999).key, "second");
});

test("adds level scaling to the scenario payout", () => {
  assert.deepEqual(calculateWorkReward(scenarios[0], 3, () => 0), {
    cash: 65,
    xp: 8,
    reputation: 0,
  });
  assert.deepEqual(calculateWorkReward(scenarios[1], 2, () => 0.999999), {
    cash: 130,
    xp: 12,
    reputation: 1,
  });
});
