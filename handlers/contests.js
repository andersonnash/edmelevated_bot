const db = require("../db");
const { randomContestName } = require("../services/generators");

async function startContest(interaction) {
  const userId = interaction.user.id;

  const showId = interaction.options.getString("show");

  const tickets = interaction.options.getInteger("tickets");

  const show = db
    .prepare(
      `
        SELECT *
        FROM shows
        WHERE id = ?
        AND owner_id = ?
        AND status = 'upcoming'
      `,
    )
    .get(showId, userId);

  if (!show) {
    return interaction.reply({
      content: "You can only create contests for your own upcoming shows.",
      ephemeral: true,
    });
  }

  const contestName = randomContestName(show.name);

  db.prepare(
    `
    INSERT INTO ticket_contests (
      show_id,
      owner_id,
      name,
      ticket_count,
      active
    )
    VALUES (
      ?,
      ?,
      ?,
      ?,
      1
    )
  `,
  ).run(show.id, userId, contestName, tickets);

  return interaction.reply(
    `🎟️ Contest started: **${contestName}**\n` +
      `Prize: ${tickets} free ticket(s) to ${show.name}`,
  );
}

async function enterContest(interaction) {
  const userId = interaction.user.id;

  const username = interaction.user.username;

  const contestId = interaction.options.getString("contest");

  const contest = db
    .prepare(
      `
        SELECT *
        FROM ticket_contests
        WHERE active = 1
        ORDER BY id DESC
        LIMIT 1
      `,
    )
    .get();

  if (!contest) {
    return interaction.reply({
      content: "There are no active contests.",
      ephemeral: true,
    });
  }

  const existing = db
    .prepare(
      `
        SELECT *
        FROM contest_entries
        WHERE contest_id = ?
        AND user_id = ?
      `,
    )
    .get(contest.id, userId);

  if (existing) {
    return interaction.reply({
      content: "You already entered.",
      ephemeral: true,
    });
  }

  db.prepare(
    `
    INSERT INTO contest_entries (
      contest_id,
      user_id,
      username
    )
    VALUES (?, ?, ?)
  `,
  ).run(contest.id, userId, username);

  return interaction.reply(`${username} entered **${contest.name}**`);
}

async function drawWinner(interaction) {
  const contestId = interaction.options.getString("contest");
  
  const contest = db
    .prepare(
      `
        SELECT *
        FROM ticket_contests
        WHERE active = 1
        ORDER BY id DESC
        LIMIT 1
      `,
    )
    .get();

  if (!contest) {
    return interaction.reply("No active contests.");
  }

  const entries = db
    .prepare(
      `
        SELECT *
        FROM contest_entries
        WHERE contest_id = ?
      `,
    )
    .all(contest.id);

  if (entries.length === 0) {
    return interaction.reply("Nobody entered.");
  }

  const winner = entries[Math.floor(Math.random() * entries.length)];

  db.prepare(
    `
    INSERT INTO show_tickets (
      show_id,
      user_id,
      username,
      price_paid,
      ticket_type
    )
    VALUES (
      ?,
      ?,
      ?,
      0,
      'free'
    )
  `,
  ).run(contest.show_id, winner.user_id, winner.username);

  db.prepare(
    `
    UPDATE shows
    SET free_tickets_given =
      free_tickets_given + ?
    WHERE id = ?
  `,
  ).run(contest.ticket_count, contest.show_id);

  db.prepare(
    `
    UPDATE ticket_contests
    SET active = 0
    WHERE id = ?
  `,
  ).run(contest.id);

  return interaction.reply(
    `🏆 ${winner.username} won ${contest.ticket_count} free ticket(s)!`,
  );
}

module.exports = {
  startContest,
  enterContest,
  drawWinner,
};
