const db = require("../db");

async function handleAutocomplete(interaction) {
  const userId = interaction.user.id;
  const focused = interaction.options.getFocused();
  if (
    ["create_show", "upgrade_venue", "hire_venue_staff"].includes(
      interaction.commandName,
    ) &&
    interaction.options.getFocused(true).name === "venue" 
  ) {
    const venues = db
      .prepare(
        `SELECT id, name FROM venues WHERE owner_id = ? AND name LIKE ? LIMIT 25`,
      )
      .all(userId, `%${focused}%`);

    return interaction.respond(
      venues.map((v) => ({ name: v.name, value: String(v.id) })),
    );
  }

  
  if (
    interaction.commandName === "hire_venue_staff" &&
    interaction.options.getFocused(true).name === "role"
  ) {
    const { VENUE_STAFF_ROLES } = require("../constants");

    const choices = Object.keys(VENUE_STAFF_ROLES).map((key) => {
      const role = VENUE_STAFF_ROLES[key];
      return {
        name: `${role.emoji} ${role.label} — $${role.cost} (+${Math.round(role.incomeBoost * 100)}%)`,
        value: key,
      };
    });

    return interaction.respond(choices);
  }
  if (
    [
      "buy_ticket",
      "run_show",
      "force_run_show",
      "promote_show",
      "add_lineup",
      "hire_staff",
      "show_lineup",
    ].includes(interaction.commandName)
  ) {
    const shows = db
      .prepare(
        `
        SELECT
          id,
          name,
          show_date
        FROM shows
        WHERE owner_id = ?
        AND status = 'upcoming'
        AND name LIKE ?
        LIMIT 25
      `,
      )
      .all(userId, `%${focused}%`);

    return interaction.respond(
      shows.map((show) => ({
        name: `${show.name} — ${show.show_date}`,
        value: String(show.id),
      })),
    );
  }
  if (interaction.commandName === "give_kandi") {
    const kandi = db
      .prepare(
        `
        SELECT
          id,
          phrase,
          color
        FROM kandi
        WHERE creator_id = ?
        LIMIT 25
      `,
      )
      .all(userId);

    return interaction.respond(
      kandi.map((k) => ({
        name: `${k.phrase} (${k.color})`,
        value: String(k.id),
      })),
    );
  }

  if (interaction.commandName === "start_contest") {
    const shows = db
      .prepare(
        `
      SELECT id, name, show_date
      FROM shows
      WHERE owner_id = ?
      AND status = 'upcoming'
      ORDER BY show_date ASC
      LIMIT 25
    `,
      )
      .all(interaction.user.id);

    return interaction.respond(
      shows.map((show) => ({
        name: `${show.name} — ${show.show_date}`,
        value: String(show.id),
      })),
    );
  }
  if (interaction.commandName === "enter_contest") {
    const contests = db
      .prepare(
        `
      SELECT
        ticket_contests.id,
        ticket_contests.name,
        shows.name AS show_name
      FROM ticket_contests
      JOIN shows
        ON shows.id = ticket_contests.show_id
      WHERE ticket_contests.active = 1
      AND ticket_contests.name LIKE ?
      LIMIT 25
    `,
      )
      .all(`%${focused}%`);

    return interaction.respond(
      contests.map((contest) => ({
        name: `${contest.name} — ${contest.show_name}`,
        value: String(contest.id),
      })),
    );
  }
  if (interaction.commandName === "draw_winner") {
    const userId = interaction.user.id;

    const contests = db
      .prepare(
        `
      SELECT
        ticket_contests.id,
        ticket_contests.name,
        shows.name AS show_name
      FROM ticket_contests
      JOIN shows
        ON shows.id = ticket_contests.show_id
      WHERE ticket_contests.owner_id = ?
      AND ticket_contests.active = 1
      AND ticket_contests.name LIKE ?
      LIMIT 25
    `,
      )
      .all(userId, `%${focused}%`);

    return interaction.respond(
      contests.map((contest) => ({
        name: `${contest.name} — ${contest.show_name}`,
        value: String(contest.id),
      })),
    );
  }
  if (interaction.commandName === "collect_show") {
    const focused = interaction.options.getFocused();

    const shows = db
      .prepare(
        `
        SELECT
          s.id,
          s.name
        FROM shows s
        WHERE s.owner_id = ?
          AND s.status = 'completed'
          AND s.name LIKE ?
          AND EXISTS (
            SELECT 1
            FROM show_payouts sp
            WHERE sp.show_id = s.id
              AND sp.paid = 0
          )
        ORDER BY s.id DESC
        LIMIT 25
        `,
      )
      .all(interaction.user.id, `%${focused}%`);

    return interaction.respond(
      shows.map((show) => ({
        name: show.name,
        value: String(show.id),
      })),
    );
  }
  if (
    interaction.commandName === "run_show" ||
    interaction.commandName === "force_run_show"
  ) {
    const shows = db
      .prepare(
        `
      SELECT
        id,
        name,
        show_date
      FROM shows
      WHERE owner_id = ?
      AND status = 'upcoming'
      AND name LIKE ?
      ORDER BY show_date ASC
      LIMIT 25
    `,
      )
      .all(userId, `%${focused}%`);

    return interaction.respond(
      shows.map((show) => ({
        name: `${show.name} — ${show.show_date}`,
        value: String(show.id),
      })),
    );
  }

  return interaction.respond([]);
}

module.exports =
  handleAutocomplete;