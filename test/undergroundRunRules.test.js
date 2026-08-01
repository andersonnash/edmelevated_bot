const assert = require("node:assert/strict");
const {
  dailyRewardMultiplier,
  entryForCash,
  resolveEncounter,
  scenarioChoices,
  scaledPayout,
} = require("../services/undergroundRunRules");

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("never blocks a broke player from starting a run", () => {
  assert.equal(entryForCash(0), 0);
  assert.equal(entryForCash(10), 10);
  assert.equal(entryForCash(500), 25);
});

test("resolves safe and busted encounters deterministically", () => {
  assert.equal(resolveEncounter("careful", () => 0).busted, true);
  const rolls = [0.9, 0];
  const result = resolveEncounter("balanced", () => rolls.shift());
  assert.equal(result.busted, false);
  assert.equal(result.cashGain, 60);
});

test("diminishes rewards without putting the activity on cooldown", () => {
  assert.equal(dailyRewardMultiplier(0), 1);
  assert.equal(dailyRewardMultiplier(3), 0.6);
  assert.equal(dailyRewardMultiplier(6), 0.4);
  assert.deepEqual(scaledPayout(101, 11, 3), {
    multiplier: 0.6,
    cash: 60,
    xp: 6,
  });
  assert.equal(scaledPayout(0, 0, 0).xp, 0);
});

test("returns a successful stake before scaling earned profit", () => {
  assert.deepEqual(scaledPayout(101, 11, 6, 25), {
    multiplier: 0.4,
    cash: 55,
    xp: 4,
  });
});

test("offers three distinct story scenarios for each run", () => {
  const choices = scenarioChoices(() => 0.5);
  assert.equal(choices.length, 3);
  assert.equal(new Set(choices.map((choice) => choice.key)).size, 3);
  assert.ok(choices.every((choice) => choice.beats.length === 3));
});
