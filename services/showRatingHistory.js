const db = require("../db");
const { calculatePromoterStats } = require("./showRatings");

function getPromoterRatingStats(ownerId) {
  const ratings = db
    .prepare(
      `
      SELECT overall_score, reputation_bonus
      FROM show_ratings
      WHERE owner_id = ?
      ORDER BY created_at ASC, id ASC
      `,
    )
    .all(ownerId);

  return calculatePromoterStats(ratings);
}

module.exports = { getPromoterRatingStats };
