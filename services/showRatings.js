function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function coverageScore(count, limit) {
  if (!limit || limit <= 0) return 100;
  return clampScore((count / limit) * 100);
}

function profitabilityScore(totalRevenue, netProfit) {
  if (totalRevenue <= 0) return netProfit >= 0 ? 50 : 0;

  const profitMargin = netProfit / totalRevenue;
  return clampScore(50 + profitMargin * 100);
}

function productionScore(show) {
  const modernProduction = Number(show.production_level || 0) * 20;
  const legacyProduction =
    Number(show.lights_level || 0) * 5 +
    Number(show.sound_level || 0) * 8 +
    Number(show.dj_equipment_level || 0) * 10 +
    Number(show.stage_level || 0) * 15;

  return clampScore(
    40 +
      modernProduction +
      legacyProduction +
      Number(show.installed_equipment_production_bonus || 0),
  );
}

function crowdReaction(overallScore, attendanceScore) {
  if (overallScore >= 90) {
    return "A city-defining night. People are already asking when the next one is.";
  }
  if (overallScore >= 75) {
    return "The room was locked in, and the crowd left wanting more.";
  }
  if (overallScore >= 60) {
    return attendanceScore >= 80
      ? "A packed room carried a solid night across the finish line."
      : "A good night with clear room to level up the production.";
  }
  if (overallScore >= 40) {
    return "There were bright spots, but the event never fully came together.";
  }
  return "A rough night in the scene. Learn from it and rebuild the next one.";
}

function ratingReputationBonus(overallScore) {
  if (overallScore >= 90) return 10;
  if (overallScore >= 75) return 5;
  if (overallScore >= 60) return 2;
  return 0;
}

function calculateShowRating({
  show,
  totalAttendance,
  totalRevenue,
  netProfit,
  djCount,
  staffCount,
}) {
  const capacity = Math.max(1, Number(show.capacity || show.base_capacity || 1));
  const attendance = clampScore((totalAttendance / capacity) * 100);
  const profitability = profitabilityScore(totalRevenue, netProfit);
  const production = productionScore(show);
  const lineup = coverageScore(djCount, Number(show.dj_limit || 0));
  const staffing = coverageScore(staffCount, Number(show.staff_limit || 0));

  const overallScore = clampScore(
    attendance * 0.3 +
      profitability * 0.25 +
      production * 0.15 +
      lineup * 0.15 +
      staffing * 0.15,
  );

  return {
    attendance,
    profitability,
    production,
    lineup,
    staffing,
    overallScore,
    stars: Number((overallScore / 20).toFixed(1)),
    reaction: crowdReaction(overallScore, attendance),
    reputationBonus: ratingReputationBonus(overallScore),
  };
}

function calculatePromoterStats(ratings) {
  if (!ratings.length) {
    return {
      totalRatedShows: 0,
      averageScore: 0,
      averageStars: 0,
      bestScore: 0,
      bestStars: 0,
      currentStreak: 0,
      bestStreak: 0,
      totalReputationBonus: 0,
    };
  }

  let currentRun = 0;
  let bestStreak = 0;

  for (const rating of ratings) {
    if (Number(rating.overall_score) >= 75) {
      currentRun += 1;
      bestStreak = Math.max(bestStreak, currentRun);
    } else {
      currentRun = 0;
    }
  }

  const totalScore = ratings.reduce(
    (sum, rating) => sum + Number(rating.overall_score || 0),
    0,
  );
  const bestScore = Math.max(
    ...ratings.map((rating) => Number(rating.overall_score || 0)),
  );

  return {
    totalRatedShows: ratings.length,
    averageScore: Math.round(totalScore / ratings.length),
    averageStars: Number((totalScore / ratings.length / 20).toFixed(1)),
    bestScore,
    bestStars: Number((bestScore / 20).toFixed(1)),
    currentStreak: currentRun,
    bestStreak,
    totalReputationBonus: ratings.reduce(
      (sum, rating) => sum + Number(rating.reputation_bonus || 0),
      0,
    ),
  };
}

module.exports = {
  calculateShowRating,
  coverageScore,
  profitabilityScore,
  productionScore,
  crowdReaction,
  ratingReputationBonus,
  calculatePromoterStats,
};
