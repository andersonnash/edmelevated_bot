const WORK_COOLDOWN_MINUTES = 45;

function selectWorkScenario(scenarios, random = Math.random) {
  if (!scenarios.length) return null;
  return scenarios[Math.floor(random() * scenarios.length)];
}

function calculateWorkReward(scenario, level = 1, random = Math.random) {
  const baseCash =
    scenario.minCash +
    Math.floor(random() * (scenario.maxCash - scenario.minCash + 1));

  return {
    cash: baseCash + Math.floor(Math.max(1, level) * 5),
    xp: scenario.xp,
    reputation: scenario.reputation || 0,
  };
}

module.exports = {
  WORK_COOLDOWN_MINUTES,
  calculateWorkReward,
  selectWorkScenario,
};
