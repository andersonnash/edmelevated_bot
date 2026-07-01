const db = require("../db");
const { addCash } = require("./economy");

function getUnpaidShowPayouts(showId) {
  return db
    .prepare(
      `
      SELECT *
      FROM show_payouts
      WHERE show_id = ?
        AND paid = 0
      ORDER BY
        CASE role
          WHEN 'owner' THEN 1
          WHEN 'dj' THEN 2
          WHEN 'staff' THEN 3
          ELSE 4
        END,
        id ASC
      `,
    )
    .all(showId);
}

function groupPayouts(payouts) {
  const owner = payouts.filter((p) => p.role === "owner");
  const djs = payouts.filter((p) => p.role === "dj");
  const staff = payouts.filter((p) => p.role === "staff");

  return {
    owner,
    djs,
    staff,
    ownerTake: owner.reduce((sum, p) => sum + p.amount, 0),
    totalPaid: payouts.reduce((sum, p) => sum + p.amount, 0),
  };
}

function settleShowPayouts(showId) {
  const payouts = getUnpaidShowPayouts(showId);

  if (!payouts.length) {
    return null;
  }

  const transaction = db.transaction(() => {
    for (const payout of payouts) {
      addCash(payout.user_id, payout.amount);
    }

    db.prepare(
      `
      UPDATE show_payouts
      SET paid = 1
      WHERE show_id = ?
        AND paid = 0
      `,
    ).run(showId);
  });

  transaction();

  return {
    payouts,
    ...groupPayouts(payouts),
  };
}

function getOwnedShow(showId, userId) {
  return db
    .prepare(
      `
      SELECT *
      FROM shows
      WHERE id = ?
        AND owner_id = ?
      `,
    )
    .get(showId, userId);
}

module.exports = {
  getUnpaidShowPayouts,
  groupPayouts,
  settleShowPayouts,
  getOwnedShow,
};
