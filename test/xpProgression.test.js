const assert = require("node:assert/strict");
const { getLevelFromXp, getLevelTitle } = require("../services/xpMath");
const { SHOW_CREATION_XP, SHOW_COMPLETION_XP } = require("../constants");

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("keeps XP levels unlimited beyond the named title table", () => {
  assert.equal(getLevelFromXp(28_800), 25);
  assert.equal(getLevelFromXp(120_050), 50);
  assert.equal(getLevelFromXp(490_050), 100);
  assert.equal(getLevelTitle(16), "Legend Lvl 16");
  assert.equal(getLevelTitle(100), "Legend Lvl 100");
});

test("requires progressively more XP at every level", () => {
  for (let level = 1; level < 200; level += 1) {
    const currentSpan = level ** 2 * 50 - (level - 1) ** 2 * 50;
    const nextSpan = (level + 1) ** 2 * 50 - level ** 2 * 50;
    assert.ok(nextSpan > currentSpan);
  }
});

test("rewards completing a show more than merely creating one", () => {
  assert.ok(SHOW_COMPLETION_XP > SHOW_CREATION_XP);
  assert.equal(SHOW_CREATION_XP + SHOW_COMPLETION_XP, 40);
});
