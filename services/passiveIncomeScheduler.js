const cron = require("node-cron");
const db = require("../db");

function startPassiveIncomeScheduler() {
  console.log("Passive income scheduler started.");

  cron.schedule("0 * * * *", () => {
    try {
      const venues = db
        .prepare(
          `
          SELECT id, owner_id, name, hourly_income
          FROM venues
          WHERE hourly_income > 0
        `,
        )
        .all();

      for (const venue of venues) {
        db.prepare(
          `
          INSERT INTO rave_payouts (
            user_id,
            show_id,
            show_name,
            profit,
            collected
          )
          VALUES (?, NULL, ?, ?, 0)
        `,
        ).run(
          venue.owner_id,
          `Venue Income: ${venue.name}`,
          venue.hourly_income,
        );
      }

      const equipment = db
        .prepare(
          `
          SELECT user_id, name, quantity, hourly_income
          FROM user_equipment
          WHERE hourly_income > 0
        `,
        )
        .all();

      for (const item of equipment) {
        const payout = item.quantity * item.hourly_income;

        db.prepare(
          `
          INSERT INTO rave_payouts (
            user_id,
            show_id,
            show_name,
            profit,
            collected
          )
          VALUES (?, NULL, ?, ?, 0)
        `,
        ).run(item.user_id, `Equipment Rental: ${item.name}`, payout);
      }

      console.log(
        `Passive income processed: ${venues.length} venues, ${equipment.length} equipment rows`,
      );
    } catch (error) {
      console.error("Passive income scheduler failed:", error);
    }
  });
}

module.exports = {
  startPassiveIncomeScheduler,
};
