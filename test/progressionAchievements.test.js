const assert = require("node:assert/strict");
const {
  achievementNames,
} = require("../services/progressionRules");

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("unlocks the existing activity achievements at their thresholds", () => {
  const unlocked = achievementNames({
    activities: { crate_digs: 10, street_team_runs: 5, rave_stories: 5 },
  });
  assert.ok(unlocked.includes("Crate Digger"));
  assert.ok(unlocked.includes("Street Team"));
  assert.ok(unlocked.includes("Story Chaser"));
});

test("unlocks Scene Icon and City Legend without capping later levels", () => {
  const unlocked = achievementNames({ level: 100, sceneReputation: 100 });
  assert.ok(unlocked.includes("Scene Icon"));
  assert.ok(unlocked.includes("City Legend"));
});

test("does not unlock achievements before their thresholds", () => {
  assert.deepEqual(
    achievementNames({
      level: 24,
      sceneReputation: 99,
      activities: { crate_digs: 9, street_team_runs: 4, rave_stories: 4 },
    }),
    [],
  );
});
