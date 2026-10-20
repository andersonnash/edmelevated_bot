const db = require("../db");
const { venueCapacity } = require("./venueEngine");
const { calculateProjectedWalkins } = require("./showForecast");
const { calculateShowRating } = require("./showRatings");
const { addSceneReputation } = require("./reputation");
const { addXp } = require("./xp");
const { SHOW_COMPLETION_XP } = require("../constants");
const { automatedTicketSummary } = require("./ticketSales");
const { getInstalledEquipmentEffects } = require("./venueEngine");

async function runShowById(showId) {
  const show = db
    .prepare(
      `
      SELECT
        shows.id AS show_id,
        shows.owner_id,
        shows.venue_id,
        shows.name,
        shows.genre,
        shows.show_date,
        shows.ticket_price,
        shows.status,
        shows.simulated_attendees,
        venues.name AS venue_name,
        venues.base_capacity,
        venues.staff_limit,
        venues.bar_level,
        venues.security_level,
        venues.production_level,
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

  const equipmentEffects = getInstalledEquipmentEffects(show.venue_id);
  show.installed_equipment_attendance_bonus = equipmentEffects.attendanceBonus;
  show.installed_equipment_production_bonus = equipmentEffects.productionBonus;

  const tickets = db
    .prepare("SELECT * FROM show_tickets WHERE show_id = ?")
    .all(show.show_id);
  const advanceSales = automatedTicketSummary(show.show_id);

  const staff = db
    .prepare(
      "SELECT * FROM show_staff WHERE show_id = ? AND status = 'assigned'",
    )
    .all(show.show_id);

  const artist = db
    .prepare("SELECT * FROM show_artists WHERE show_id = ?")
    .get(show.show_id);

  const finalCapacity = venueCapacity(show);
  const admittedTickets = tickets.slice(0, finalCapacity);
  const confirmedTicketCount =
    admittedTickets.length + Number(advanceSales.quantity || 0);
  const projectedWalkins = calculateProjectedWalkins({
    baseWalkins: Number(show.simulated_attendees || 0),
    venue: show,
    ticketCount: confirmedTicketCount,
    artistDemand: Number(artist?.demand_bonus || 0),
  });
  const adjustedWalkins = projectedWalkins;

  const paidRevenue =
    admittedTickets.reduce(
      (sum, ticket) => sum + (ticket.price_paid || 0),
      0,
    ) + Number(advanceSales.revenue || 0);

  const simulatedRevenue = Math.floor(
    adjustedWalkins * (show.ticket_price || 0),
  );

  const totalAttendance = confirmedTicketCount + adjustedWalkins;
  const totalRevenue = paidRevenue + simulatedRevenue;

  const staffCost = staff.reduce((sum, person) => sum + (person.pay || 0), 0);
  const artistFee = Number(artist?.booking_fee || 0);

  const operatingCost =
    Math.floor(finalCapacity * 0.5) + Math.floor(totalAttendance * 1);

  const upgradeBonus =
    (show.lights_level || 0) * 0.1 +
    (show.sound_level || 0) * 0.15 +
    (show.dj_equipment_level || 0) * 0.2 +
    (show.stage_level || 0) * 0.35;

  const bonusRevenue = Math.floor(totalRevenue * upgradeBonus);

  const settlementPayout = totalRevenue + bonusRevenue - staffCost - operatingCost;
  const eventProfit = settlementPayout - artistFee;

  const rating = calculateShowRating({
    show: { ...show, capacity: finalCapacity },
    totalAttendance,
    totalRevenue: totalRevenue + bonusRevenue,
    netProfit: eventProfit,
    artistBooked: Boolean(artist),
    staffCount: staff.length,
  });

  const attendancePercent = Math.min(1, totalAttendance / finalCapacity);
  const baseReputationGain = Math.max(1, Math.ceil(attendancePercent * 5));
  const reputationGain = baseReputationGain + rating.reputationBonus;

  let xpUpdate;
  const transaction = db.transaction(() => {
    db.prepare(
      `
      INSERT INTO show_ratings (
        show_id,
        owner_id,
        attendance_score,
        profitability_score,
        production_score,
        artist_score,
        staffing_score,
        overall_score,
        star_rating,
        reputation_bonus,
        crowd_reaction
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
    ).run(
      show.show_id,
      show.owner_id,
      rating.attendance,
      rating.profitability,
      rating.production,
      rating.artist,
      rating.staffing,
      rating.overallScore,
      rating.stars,
      rating.reputationBonus,
      rating.reaction,
    );

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
      UPDATE show_staff
      SET status = 'completed'
      WHERE show_id = ?
      AND status = 'assigned'
     `,
    ).run(show.show_id);

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
    ).run(show.show_id, show.owner_id, null, settlementPayout);

    addSceneReputation(show.owner_id, reputationGain);
    xpUpdate = addXp(show.owner_id, SHOW_COMPLETION_XP);

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
    tickets,
    advanceSales,
    confirmedTicketCount,
    staff,
    artist,
    adjustedWalkins,
    rawWalkinDemand: Number(show.simulated_attendees || 0),
    paidRevenue,
    simulatedRevenue,
    totalAttendance,
    staffCost,
    artistFee,
    operatingCost,
    bonusRevenue,
    settlementPayout,
    eventProfit,
    rating,
    baseReputationGain,
    reputationGain,
    xpUpdate,
    payouts: {
      owner: settlementPayout,
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
