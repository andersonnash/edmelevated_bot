const db = require("../db");
const {
  calculateProjectedWalkins,
  isProjectedSoldOut,
} = require("./showForecast");

function ownedUpcomingShows(userId) {
  return db
    .prepare(
      `
      SELECT
        shows.id,
        shows.name,
        shows.simulated_attendees,
        venues.base_capacity,
        venues.security_level,
        venues.production_level,
        (SELECT COUNT(*) FROM show_tickets WHERE show_id = shows.id) +
        COALESCE((
          SELECT SUM(quantity)
          FROM automated_ticket_sales
          WHERE show_id = shows.id
        ), 0) AS ticket_count
      FROM shows
      JOIN venues ON venues.id = shows.venue_id
      WHERE shows.owner_id = ?
        AND shows.status = 'upcoming'
      ORDER BY shows.show_date ASC, shows.id ASC
      `,
    )
    .all(userId);
}

function isBoostableShow(show) {
  return !isProjectedSoldOut({
    baseWalkins: Number(show.simulated_attendees || 0),
    venue: show,
    ticketCount: Number(show.ticket_count || 0),
  });
}

function selectRandomBoostableShow(shows, random = Math.random) {
  const eligible = shows.filter(isBoostableShow);
  if (!eligible.length) return null;

  return eligible[Math.floor(random() * eligible.length)];
}

function projectedWalkins(show, baseWalkins = show.simulated_attendees) {
  return calculateProjectedWalkins({
    baseWalkins: Number(baseWalkins || 0),
    venue: show,
    ticketCount: Number(show.ticket_count || 0),
  });
}

function boostRandomOwnedUpcomingShow(userId, amount, random = Math.random) {
  const shows = ownedUpcomingShows(userId);
  if (!shows.length) {
    return { show: null, reason: "no_upcoming" };
  }

  const show = selectRandomBoostableShow(shows, random);
  if (!show) {
    return { show: null, reason: "all_full" };
  }

  const projectedBefore = projectedWalkins(show);
  db.prepare(
    "UPDATE shows SET simulated_attendees = simulated_attendees + ? WHERE id = ?",
  ).run(amount, show.id);
  const projectedAfter = projectedWalkins(
    show,
    Number(show.simulated_attendees || 0) + amount,
  );

  return {
    show,
    reason: null,
    amount,
    projectedBefore,
    projectedAfter,
  };
}

module.exports = {
  boostRandomOwnedUpcomingShow,
  isBoostableShow,
  ownedUpcomingShows,
  selectRandomBoostableShow,
};
