const assert = require("node:assert/strict");

const {
  calculateShowRating,
  coverageScore,
  profitabilityScore,
  ratingReputationBonus,
} = require("../services/showRatings");

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("scores lineup and staffing coverage", () => {
  assert.equal(coverageScore(0, 2), 0);
  assert.equal(coverageScore(1, 2), 50);
  assert.equal(coverageScore(3, 2), 100);
  assert.equal(coverageScore(0, 0), 100);
});

test("scores profitability around break-even", () => {
  assert.equal(profitabilityScore(1000, -500), 0);
  assert.equal(profitabilityScore(1000, 0), 50);
  assert.equal(profitabilityScore(1000, 250), 75);
  assert.equal(profitabilityScore(1000, 500), 100);
});

test("produces a strong rating for a successful fully staffed show", () => {
  const rating = calculateShowRating({
    show: {
      capacity: 100,
      production_level: 2,
      dj_limit: 2,
      staff_limit: 4,
    },
    totalAttendance: 95,
    totalRevenue: 4000,
    netProfit: 1800,
    djCount: 2,
    staffCount: 4,
  });

  assert.equal(rating.attendance, 95);
  assert.equal(rating.profitability, 95);
  assert.equal(rating.production, 80);
  assert.equal(rating.lineup, 100);
  assert.equal(rating.staffing, 100);
  assert.equal(rating.overallScore, 94);
  assert.equal(rating.stars, 4.7);
  assert.equal(rating.reputationBonus, 10);
});

test("caps scores and assigns reputation bonuses by rating tier", () => {
  assert.equal(ratingReputationBonus(59), 0);
  assert.equal(ratingReputationBonus(60), 2);
  assert.equal(ratingReputationBonus(75), 5);
  assert.equal(ratingReputationBonus(90), 10);
});
