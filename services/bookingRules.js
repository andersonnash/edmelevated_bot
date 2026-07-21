const COOLDOWN_MS = 6 * 60 * 60 * 1000;

function parseDatabaseTime(value) {
  if (!value) return null;
  return new Date(value.replace(" ", "T") + "Z");
}

function repeatableBookingStatus({
  lastCompletedAt,
  completedToday,
  dailyLimit = 3,
  now = new Date(),
}) {
  if (completedToday >= dailyLimit) {
    return { available: false, reason: "daily_limit", remainingMs: 0 };
  }

  const lastCompleted = parseDatabaseTime(lastCompletedAt);
  const remainingMs = lastCompleted
    ? Math.max(0, COOLDOWN_MS - (now - lastCompleted))
    : 0;

  if (remainingMs > 0) {
    return { available: false, reason: "cooldown", remainingMs };
  }

  return { available: true, reason: null, remainingMs: 0 };
}

function calculateBookingReward(
  booking,
  approach,
  djReputation = 0,
  repeatable = false,
  genreMatch = false,
) {
  const careerMultiplier = repeatable
    ? 1 + Math.min(Math.max(0, djReputation), 100) / 200
    : 1;

  return {
    cash: Math.round(
      booking.cash *
        approach.cashMultiplier *
        careerMultiplier *
        (genreMatch ? 1.1 : 1),
    ),
    xp: booking.xp + approach.xpBonus,
    reputation: booking.reputation + (approach.reputationBonus || 0),
    djReputation:
      booking.djReputation +
      approach.djReputationBonus +
      (genreMatch ? 2 : 0),
    showBonus: booking.showBonus + (approach.showBonusBonus || 0),
  };
}

function formatRemainingTime(remainingMs) {
  const totalMinutes = Math.ceil(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function careerMilestoneStatus({
  milestone,
  prerequisiteComplete,
  repeatableRuns,
  djReputation,
}) {
  return {
    unlocked:
      prerequisiteComplete &&
      repeatableRuns >= milestone.repeatableRunsRequired &&
      djReputation >= milestone.djReputationRequired,
    prerequisiteComplete,
    repeatableRuns,
    currentDjReputation: djReputation,
  };
}

module.exports = {
  calculateBookingReward,
  careerMilestoneStatus,
  formatRemainingTime,
  parseDatabaseTime,
  repeatableBookingStatus,
};
