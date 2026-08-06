function purchasePromotion({
  db,
  showId,
  userId,
  username,
  cost,
  demand,
}) {
  const transaction = db.transaction(() => {
    const claimed = db.prepare(
      `UPDATE shows
       SET promotion_used = 1,
           simulated_attendees = simulated_attendees + ?
       WHERE id = ?
         AND owner_id = ?
         AND status = 'upcoming'
         AND COALESCE(promotion_used, 0) = 0`,
    ).run(demand, showId, userId);

    if (claimed.changes !== 1) {
      throw new Error("PROMOTION_ALREADY_USED");
    }

    const charged = db.prepare(
      `UPDATE users
       SET cash = cash - ?
       WHERE discord_id = ? AND cash >= ?`,
    ).run(cost, userId, cost);

    if (charged.changes !== 1) {
      throw new Error("INSUFFICIENT_PROMOTION_CASH");
    }

    db.prepare(
      `INSERT INTO show_promotions (
         show_id, promoter_id, promoter_username, promo_text, hype_gain
       ) VALUES (?, ?, ?, ?, ?)`,
    ).run(
      showId,
      userId,
      username,
      "ran the show's one city-wide campaign",
      demand,
    );

    return db
      .prepare("SELECT cash FROM users WHERE discord_id = ?")
      .get(userId).cash;
  });

  return transaction();
}

module.exports = { purchasePromotion };
