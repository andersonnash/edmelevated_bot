const db = require("../db");
const { randomShowEvent } = require("./generators");
const { addDjReputation, calculateDjBookingFee } = require("./djs");
const { addCash } = require("./economy");
const { venueCapacity, venueAttendanceBonus } = require("./venueEngine");

async function runShowById(showId) {
  const show = db
    .prepare(
      `
      SELECT
        shows.id AS show_id,
        shows.owner_id,
        shows.venue_id,
        shows.name,
        shows.show_date,
        shows.ticket_price,
        shows.status,
        shows.tickets_sold,
        shows.free_tickets_given,
        shows.simulated_attendees,
        venues.name AS venue_name,
        venues.base_capacity,
        venues.bar_level,
        venues.security_level,
        venues.production_level,
        venues.maintenance_level,
        venues.lights_level,
        venues.sound_level,
        venues.dj_equipment_level,
        venues.stage_level
      FROM shows
      JOIN venues ON venues.id = shows.venue_id
      WHERE shows.id = ?
      AND shows.status = 'upcoming'
    `,
    )
    .get(showId);

  if (!show) {
    return null;
  }

  const tickets = db
    .prepare("SELECT * FROM show_tickets WHERE show_id = ?")
    .all(show.show_id);

  const staff = db
    .prepare(
      "SELECT * FROM show_staff WHERE show_id = ? AND status = 'assigned'",
    )
    .all(show.show_id);

  const lineup = db
    .prepare("SELECT * FROM show_lineup WHERE show_id = ?")
    .all(show.show_id);

  const event = randomShowEvent();

  const adjustedWalkins = Math.max(
    0,
    (show.simulated_attendees || 0) + event.attendance,
  );

  const paidRevenue = tickets.reduce(
    (sum, ticket) => sum + (ticket.price_paid || 0),
    0,
  );

  const simulatedRevenue = Math.floor(
    adjustedWalkins * (show.ticket_price || 0) * event.revenueMultiplier,
  );

  let totalAttendance = tickets.length + adjustedWalkins;
  const totalRevenue = paidRevenue + simulatedRevenue;

  const finalCapacity = venueCapacity(show);

  
  totalAttendance = Math.floor(
    totalAttendance * (1 + (venueAttendanceBonus(show) || 0)),
  );

  totalAttendance = Math.min(totalAttendance, finalCapacity);

  const staffCost = staff.reduce((sum, person) => sum + (person.pay || 0), 0);
  const lineupCost = lineup.reduce((sum, dj) => sum + (dj.pay || 0), 0);

  const operatingCost =
    Math.floor(finalCapacity * 0.5) + Math.floor(totalAttendance * 1);

  
  const upgradeBonus =
    (show.lights_level || 0) * 0.1 +
    (show.sound_level || 0) * 0.15 +
    (show.dj_equipment_level || 0) * 0.2 +
    (show.stage_level || 0) * 0.35;

  const bonusRevenue = Math.floor(totalRevenue * upgradeBonus);

  const netProfit =
    totalRevenue + bonusRevenue - staffCost - lineupCost - operatingCost;

  const reputationGain = Math.max(
    1,
    Math.floor(totalAttendance / 2) + (event.reputation || 0),
  );

  
  const transaction = db.transaction(() => {
    for (const dj of lineup) {
      db.prepare(
        `
        INSERT INTO show_payouts (
          show_id,
          user_id,
          username,
          role,
          amount,
          paid
        )
        VALUES (?, ?, ?, 'dj', ?, 0)
        `,
      ).run(show.show_id, dj.dj_user_id, dj.dj_username, dj.pay);

      const djRepGain = Math.max(1, Math.floor(totalAttendance / 75));
      addDjReputation(dj.dj_user_id, djRepGain);
    }

    for (const person of staff) {
      db.prepare(
        `
        INSERT INTO show_payouts (
          show_id,
          user_id,
          username,
          role,
          amount,
          paid
        )
        VALUES (?, ?, ?, 'staff', ?, 0)
        `,
      ).run(
        show.show_id,
        person.hired_user_id,
        person.hired_username,
        person.pay,
      );
    }

    db.prepare(
      `
      INSERT INTO show_payouts (
        show_id,
        user_id,
        username,
        role,
        amount,
        paid
      )
      VALUES (?, ?, ?, 'owner', ?, 0)
      `,
    ).run(show.show_id, show.owner_id, null, netProfit);

    db.prepare(
      `
      UPDATE users
      SET reputation = reputation + ?
      WHERE discord_id = ?
      `,
    ).run(reputationGain, show.owner_id);

    db.prepare(
      `
      UPDATE shows
      SET status = 'completed'
      WHERE id = ?
      `,
    ).run(show.show_id);
  });

  transaction();

  return {
    show,
    event,
    tickets,
    staff,
    lineup,
    adjustedWalkins,
    paidRevenue,
    simulatedRevenue,
    totalAttendance,
    staffCost,
    lineupCost,
    operatingCost,
    bonusRevenue,
    netProfit,
    reputationGain,
    payouts: {
      owner: netProfit,
      djs: lineup.map((dj) => ({
        userId: dj.dj_user_id,
        username: dj.dj_username,
        amount: dj.pay,
      })),
      staff: staff.map((person) => ({
        userId: person.hired_user_id,
        username: person.hired_username,
        amount: person.pay,
      })),
    },
  };
}

module.exports = {
  runShowById,
};   