const assert = require("node:assert/strict");
const {
  journeyRequirements,
  showcaseCashReward,
  showcaseUnlocked,
} = require("../services/journeyRules");

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("unlocks the showcase only after the opening journey requirements", () => {
  const input = {
    equipmentCount: 1,
    openDecksComplete: true,
    activities: { street_team_runs: 1, crate_digs: 1 },
  };
  assert.equal(showcaseUnlocked(input), true);
  assert.equal(showcaseUnlocked({ ...input, equipmentCount: 0 }), false);
});

test("accepts either crate digging or a rave story as the scene activity", () => {
  const requirements = journeyRequirements({
    equipmentCount: 1,
    openDecksComplete: true,
    activities: { street_team_runs: 1, rave_stories: 1 },
  });
  assert.equal(requirements.sceneActivity, true);
});

test("bridges low-cash players to the first venue with a small reserve", () => {
  assert.equal(showcaseCashReward(1_563), 1_187);
  assert.equal(1_563 + showcaseCashReward(1_563), 2_750);
  assert.equal(showcaseCashReward(3_000), 900);
});
