const assert = require("node:assert/strict");
const {
  calculateBookingReward,
  careerMilestoneStatus,
  repeatableBookingStatus,
} = require("../services/bookingRules");

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

test("enforces the repeatable booking cooldown", () => {
  const now = new Date("2026-07-20T12:00:00Z");
  const status = repeatableBookingStatus({
    lastCompletedAt: "2026-07-20 08:00:00",
    completedToday: 1,
    now,
  });

  assert.equal(status.available, false);
  assert.equal(status.reason, "cooldown");
  assert.equal(status.remainingMs, 2 * 60 * 60 * 1000);
});

test("enforces the daily repeatable booking limit", () => {
  const status = repeatableBookingStatus({
    lastCompletedAt: null,
    completedToday: 3,
  });

  assert.equal(status.available, false);
  assert.equal(status.reason, "daily_limit");
});

test("scales repeatable cash with DJ reputation but caps the bonus", () => {
  const booking = {
    cash: 400,
    xp: 35,
    reputation: 3,
    djReputation: 5,
    showBonus: 8,
  };
  const approach = {
    cashMultiplier: 1.15,
    xpBonus: 10,
    djReputationBonus: 1,
  };

  assert.equal(calculateBookingReward(booking, approach, 0, true).cash, 460);
  assert.equal(calculateBookingReward(booking, approach, 50, true).cash, 575);
  assert.equal(calculateBookingReward(booking, approach, 500, true).cash, 690);
});

test("rewards repeatable gigs that match the DJ's career genre", () => {
  const booking = {
    cash: 400,
    xp: 35,
    reputation: 3,
    djReputation: 5,
    showBonus: 8,
  };
  const approach = {
    cashMultiplier: 1,
    xpBonus: 5,
    djReputationBonus: 2,
  };
  const reward = calculateBookingReward(
    booking,
    approach,
    0,
    true,
    true,
  );

  assert.equal(reward.cash, 440);
  assert.equal(reward.djReputation, 9);
  assert.equal(reward.reputation, 1);
});

test("reduces repeatable Scene Reputation without changing milestones", () => {
  const booking = {
    cash: 400,
    xp: 35,
    reputation: 5,
    djReputation: 5,
    showBonus: 8,
  };
  const approach = {
    cashMultiplier: 1,
    xpBonus: 0,
    reputationBonus: 2,
    djReputationBonus: 0,
  };

  assert.equal(calculateBookingReward(booking, approach, 0, true).reputation, 3);
  assert.equal(calculateBookingReward(booking, approach, 0, false).reputation, 7);
});

test("locks career milestones until every requirement is met", () => {
  const milestone = {
    repeatableRunsRequired: 4,
    djReputationRequired: 35,
  };

  assert.equal(
    careerMilestoneStatus({
      milestone,
      prerequisiteComplete: true,
      repeatableRuns: 3,
      djReputation: 40,
    }).unlocked,
    false,
  );
  assert.equal(
    careerMilestoneStatus({
      milestone,
      prerequisiteComplete: true,
      repeatableRuns: 4,
      djReputation: 35,
    }).unlocked,
    true,
  );
});

test("booking-specific choices modify reputation and next-show demand", () => {
  const reward = calculateBookingReward(
    {
      cash: 400,
      xp: 35,
      reputation: 3,
      djReputation: 5,
      showBonus: 5,
    },
    {
      cashMultiplier: 0.95,
      xpBonus: 12,
      reputationBonus: 0,
      djReputationBonus: 4,
      showBonusBonus: 2,
    },
  );

  assert.deepEqual(reward, {
    cash: 380,
    xp: 47,
    reputation: 3,
    djReputation: 9,
    showBonus: 7,
  });
});
