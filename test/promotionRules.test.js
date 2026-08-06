const test = require("node:test");
const assert = require("node:assert/strict");
const { promotionCampaign } = require("../services/promotionRules");

test("scales one campaign with every venue tier", () => {
  const expected = [
    ["garage_party", 100, 8],
    ["warehouse", 300, 30],
    ["underground_club", 900, 75],
    ["downtown_venue", 2400, 180],
    ["festival_grounds", 8000, 750],
  ];

  for (const [type, cost, demand] of expected) {
    assert.deepEqual(promotionCampaign({ type }), { cost, demand });
  }
});

test("rejects an unknown venue type", () => {
  assert.throws(() => promotionCampaign({ type: "unknown" }), /Unknown venue type/);
});
