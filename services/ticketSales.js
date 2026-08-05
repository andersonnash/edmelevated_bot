const { EmbedBuilder } = require("discord.js");
const db = require("../db");
const { money } = require("./formatters");
const { calculateProjectedWalkins } = require("./showForecast");
const { venueCapacity } = require("./venueEngine");

const TICKET_SALE_CHANCE = 0.4;
const TICKET_SALE_COOLDOWN_HOURS = 12;

const TICKET_SALE_SCENARIOS = [
  {
    key: "dance_crew",
    headline: "A local dance crew reserved a block of tickets.",
  },
  {
    key: "community_calendar",
    headline: "A community calendar feature sent new people to the ticket page.",
  },
  {
    key: "group_chat",
    headline: "The show started circulating through local group chats.",
  },
  {
    key: "visiting_crew",
    headline: "A visiting crew locked in plans for the night.",
  },
  {
    key: "word_of_mouth",
    headline: "Word of mouth turned into a fresh run of advance sales.",
  },
];

function ticketBatchRange(capacity) {
  if (capacity <= 25) return { minimum: 1, maximum: 3 };
  if (capacity <= 100) return { minimum: 3, maximum: 8 };
  if (capacity <= 250) return { minimum: 6, maximum: 18 };
  if (capacity <= 600) return { minimum: 15, maximum: 40 };
  return { minimum: 40, maximum: 120 };
}

function totalTicketCount(show) {
  return (
    Number(show.player_ticket_count || 0) +
    Number(show.automated_ticket_count || 0)
  );
}

function projectedAttendance(show, ticketCount = totalTicketCount(show)) {
  const walkins = calculateProjectedWalkins({
    baseWalkins: Number(show.simulated_attendees || 0),
    venue: show,
    ticketCount,
  });

  return { walkins, total: ticketCount + walkins };
}

function ticketSaleOpportunity(show) {
  const capacity = venueCapacity(show);
  const before = projectedAttendance(show);
  const openCapacity = Math.max(0, capacity - before.total);

  if (openCapacity > 0) {
    return { mode: "growth", available: openCapacity, before, capacity };
  }

  if (before.walkins > 0) {
    return {
      mode: "conversion",
      available: before.walkins,
      before,
      capacity,
    };
  }

  return { mode: null, available: 0, before, capacity };
}

function saleQuantity(show, random = Math.random) {
  const opportunity = ticketSaleOpportunity(show);
  if (!opportunity.available) return 0;

  const range = ticketBatchRange(opportunity.capacity);
  const maximum = Math.min(range.maximum, opportunity.available);
  const minimum = Math.min(range.minimum, maximum);
  return minimum + Math.floor(random() * (maximum - minimum + 1));
}

function selectRandomShow(shows, random = Math.random) {
  const eligible = shows.filter((show) => saleQuantity(show, () => 0) > 0);
  if (!eligible.length) return null;
  return eligible[Math.floor(random() * eligible.length)];
}

function automatedTicketSummary(showId) {
  return db
    .prepare(
      `
      SELECT
        COALESCE(SUM(quantity), 0) AS quantity,
        COALESCE(SUM(quantity * price_each), 0) AS revenue
      FROM automated_ticket_sales
      WHERE show_id = ?
      `,
    )
    .get(showId);
}

function eligibleShowsForOwner(ownerId, { ignoreCooldown = false } = {}) {
  const cooldownClause = ignoreCooldown
    ? ""
    : `
        AND NOT EXISTS (
          SELECT 1
          FROM automated_ticket_sales recent_sales
          WHERE recent_sales.show_id = shows.id
            AND recent_sales.created_at > datetime('now', ?)
        )`;
  const statement = db.prepare(
    `
      SELECT
        shows.id,
        shows.owner_id,
        shows.name,
        shows.show_date,
        shows.ticket_price,
        shows.simulated_attendees,
        venues.base_capacity,
        venues.security_level,
        venues.production_level,
        (SELECT COUNT(*) FROM show_tickets WHERE show_id = shows.id)
          AS player_ticket_count,
        COALESCE((
          SELECT SUM(price_paid)
          FROM show_tickets
          WHERE show_id = shows.id
        ), 0) AS player_ticket_revenue,
        COALESCE((
          SELECT SUM(quantity)
          FROM automated_ticket_sales
          WHERE show_id = shows.id
        ), 0) AS automated_ticket_count,
        COALESCE((
          SELECT SUM(quantity * price_each)
          FROM automated_ticket_sales
          WHERE show_id = shows.id
        ), 0) AS automated_ticket_revenue
      FROM shows
      JOIN venues ON venues.id = shows.venue_id
      WHERE shows.owner_id = ?
        AND shows.status = 'upcoming'
        AND shows.show_date > date('now')
        ${cooldownClause}
      ORDER BY shows.show_date ASC, shows.id ASC
      `,
  );

  return ignoreCooldown
    ? statement.all(ownerId)
    : statement.all(ownerId, `-${TICKET_SALE_COOLDOWN_HOURS} hours`);
}

function recordTicketSale(show, random = Math.random) {
  const opportunity = ticketSaleOpportunity(show);
  const quantity = saleQuantity(show, random);
  if (!quantity) return null;

  const scenario =
    TICKET_SALE_SCENARIOS[
      Math.floor(random() * TICKET_SALE_SCENARIOS.length)
    ];
  const ticketCountBefore = totalTicketCount(show);
  const attendanceBefore = projectedAttendance(show, ticketCountBefore);
  const ticketCountAfter = ticketCountBefore + quantity;
  const attendanceAfter = projectedAttendance(show, ticketCountAfter);

  db.prepare(
    `
    INSERT INTO automated_ticket_sales (
      show_id, quantity, price_each, scenario_key
    ) VALUES (?, ?, ?, ?)
    `,
  ).run(show.id, quantity, show.ticket_price, scenario.key);

  return {
    ownerId: show.owner_id,
    show,
    scenario,
    mode: opportunity.mode,
    quantity,
    ticketCountBefore,
    ticketCountAfter,
    attendanceBefore: attendanceBefore.total,
    attendanceAfter: attendanceAfter.total,
    walkinsBefore: attendanceBefore.walkins,
    walkinsAfter: attendanceAfter.walkins,
    capacity: venueCapacity(show),
    revenueBefore:
      Number(show.player_ticket_revenue || 0) +
      Number(show.automated_ticket_revenue || 0),
    revenueAfter:
      Number(show.player_ticket_revenue || 0) +
      Number(show.automated_ticket_revenue || 0) +
      quantity * show.ticket_price,
    projectedRevenueBefore:
      Number(show.player_ticket_revenue || 0) +
      Number(show.automated_ticket_revenue || 0) +
      attendanceBefore.walkins * show.ticket_price,
    projectedRevenueAfter:
      Number(show.player_ticket_revenue || 0) +
      Number(show.automated_ticket_revenue || 0) +
      quantity * show.ticket_price +
      attendanceAfter.walkins * show.ticket_price,
  };
}

function runTicketSalesCheck(random = Math.random) {
  const ownerIds = db
    .prepare(
      `
      SELECT DISTINCT owner_id
      FROM shows
      WHERE status = 'upcoming'
        AND show_date > date('now')
      `,
    )
    .all()
    .map((row) => row.owner_id);
  const results = [];

  for (const ownerId of ownerIds) {
    if (random() >= TICKET_SALE_CHANCE) continue;

    const show = selectRandomShow(eligibleShowsForOwner(ownerId), random);
    if (!show) continue;

    const result = recordTicketSale(show, random);
    if (result) results.push(result);
  }

  return results;
}

function forceTicketSaleForOwner(ownerId, random = Math.random) {
  const show = selectRandomShow(
    eligibleShowsForOwner(ownerId, { ignoreCooldown: true }),
    random,
  );
  return show ? recordTicketSale(show, random) : null;
}

function buildTicketSaleEmbed(result) {
  return new EmbedBuilder()
    .setColor(0x22c55e)
    .setTitle("🎟 ADVANCE SALES")
    .setDescription(`**${result.show.name}**\n${result.scenario.headline}`)
    .addFields(
      {
        name: "Tickets Sold",
        value: `+${result.quantity}`,
        inline: true,
      },
      {
        name: "Confirmed Tickets",
        value: `${result.ticketCountBefore} → **${result.ticketCountAfter}**`,
        inline: true,
      },
      {
        name: "Projected Attendance",
        value: `${result.attendanceBefore} → **${result.attendanceAfter} / ${result.capacity}**`,
      },
      {
        name: "Projected Walk-ins",
        value: `${result.walkinsBefore} → **${result.walkinsAfter}**`,
        inline: true,
      },
      {
        name: "Confirmed Revenue",
        value: `${money(result.revenueBefore)} → **${money(result.revenueAfter)}**`,
      },
      {
        name: "Projected Total Revenue",
        value:
          result.mode === "conversion"
            ? `${money(result.projectedRevenueAfter)} • unchanged`
            : `${money(result.projectedRevenueBefore)} → **${money(result.projectedRevenueAfter)}**`,
      },
    )
    .setFooter({
      text:
        result.mode === "conversion"
          ? "Projected walk-ins became confirmed buyers. Attendance and projected total revenue stayed the same."
          : "Advance sales added confirmed demand and projected revenue.",
    });
}

async function processTicketSales(client) {
  const results = runTicketSalesCheck();

  for (const result of results) {
    try {
      const user = await client.users.fetch(result.ownerId);
      await user.send({ embeds: [buildTicketSaleEmbed(result)] });
    } catch (error) {
      console.error("Advance ticket-sale DM failed:", error);
    }
  }

  return results;
}

module.exports = {
  TICKET_SALE_CHANCE,
  TICKET_SALE_COOLDOWN_HOURS,
  TICKET_SALE_SCENARIOS,
  automatedTicketSummary,
  buildTicketSaleEmbed,
  forceTicketSaleForOwner,
  processTicketSales,
  projectedAttendance,
  runTicketSalesCheck,
  saleQuantity,
  selectRandomShow,
  ticketBatchRange,
  ticketSaleOpportunity,
  totalTicketCount,
};
