const db = require("../db");
const {
  SHOP_ITEMS,
  VENUE_TYPES,
  VENUE_DEPARTMENTS,
  VENUE_INSURANCE,
} = require("../constants");
const {
  venueInsuranceCost,
  venueDepartmentUpgradeCost,
  venueStaffHiringCost,
} = require("../services/venueInvestmentRules");
const { venueCapacity } = require("../services/venueEngine");
const { canListTicketShow } = require("../services/ticketRules");
const { numberOwnedVenues } = require("../services/venueDisplayRules");
const {
  venueDepartmentLevelName,
  venueDepartmentBenefitLabel,
} = require("../services/venueDepartmentRules");

async function handleAutocomplete(interaction) {
  const userId = interaction.user.id;
  const focused = interaction.options.getFocused();
  if (
    interaction.commandName === "equip_title" &&
    interaction.options.getFocused(true).name === "title"
  ) {
    const focusedLower = focused.toLowerCase();

    const ownedRows = db
      .prepare(
        `
      SELECT item_key
      FROM user_cosmetics
      WHERE user_id = ?
        AND item_type = 'cosmetic_title'
      ORDER BY purchased_at DESC
      LIMIT 25
      `,
      )
      .all(userId);

    const ownedTitles = ownedRows
      .map((row) => SHOP_ITEMS[row.item_key])
      .filter(Boolean)
      .filter((item) => item.name.toLowerCase().includes(focusedLower));

    const choices = ownedTitles.map((item) => ({
      name: item.name,
      value: item.key,
    }));

    if (
      !focusedLower ||
      "unequip scene title".includes(focusedLower) ||
      "remove scene title".includes(focusedLower)
    ) {
      choices.unshift({
        name: "Unequip Scene Title",
        value: "none",
      });
    }

    return interaction.respond(choices.slice(0, 25));
  }
  if (
    ["create_show", "upgrade_venue", "hire_venue_staff", "venue_insurance"].includes(
      interaction.commandName,
    ) &&
    interaction.options.getFocused(true).name === "venue"
  ) {
    const venues = numberOwnedVenues(
      db
      .prepare(
        `
        SELECT
          id,
          name,
          type,
          bar_level,
          security_level,
          production_level,
          insurance_expires_at
        FROM venues
        WHERE owner_id = ?
        ORDER BY id ASC
        LIMIT 25
        `,
      )
      .all(userId),
    ).filter((venue) =>
      venue.name.toLowerCase().includes(focused.toLowerCase()),
    );

    return interaction.respond(
      venues.map((venue) => {
        let details =
          `${venueDepartmentLevelName("bar", venue.bar_level)} / Sec ${venue.security_level} / ` +
          `Prod ${venue.production_level}`;

        if (interaction.commandName === "venue_insurance") {
          const insuranceActive =
            venue.insurance_expires_at &&
            new Date(
              venue.insurance_expires_at.replace(" ", "T") + "Z",
            ) > new Date();

          details = insuranceActive
            ? "Already insured"
            : `$${venueInsuranceCost(venue.type).toLocaleString()} for ${VENUE_INSURANCE.durationHours} hours`;
        } else if (interaction.commandName === "hire_venue_staff") {
          details = VENUE_TYPES[venue.type]?.name || "Venue";
        } else if (interaction.commandName === "create_show") {
          details = VENUE_TYPES[venue.type]?.name || "Venue";
        }

        return {
          name: `${venue.name} • Your Venue ${venue.ownerVenueNumber} — ${details}`.slice(0, 100),
          value: String(venue.id),
        };
      }),
    );
  }

  if (
    interaction.commandName === "upgrade_venue" &&
    interaction.options.getFocused(true).name === "department"
  ) {
    const venueId = interaction.options.getString("venue");
    const venue = venueId
      ? db
          .prepare("SELECT * FROM venues WHERE id = ? AND owner_id = ?")
          .get(venueId, userId)
      : null;

    if (!venue) {
      return interaction.respond([]);
    }

    const focusedLower = focused.toLowerCase();
    const choices = Object.entries(VENUE_DEPARTMENTS)
      .filter(([key, department]) =>
        `${key} ${department.name}`.toLowerCase().includes(focusedLower),
      )
      .map(([key, department]) => {
        const currentLevel = venue[department.column] || 0;
        const nextLevel = currentLevel + 1;
        const cost = venueDepartmentUpgradeCost(
          venue.type,
          key,
          nextLevel,
        );
        const nextName = venueDepartmentLevelName(key, nextLevel);

        return {
          name: (
            `${department.emoji} ${nextName} • ${department.name} ` +
            `Lv.${currentLevel} → Lv.${nextLevel} — ` +
            `$${cost.toLocaleString()} — ${venueDepartmentBenefitLabel(key, nextLevel)}`
          ).slice(0, 100),
          value: key,
        };
      });

    return interaction.respond(choices);
  }

  if (interaction.commandName === "buy_venue") {
    const focusedValue = interaction.options.getFocused().toLowerCase();

    const choices = Object.entries(VENUE_TYPES)
      .filter(([key, venue]) => {
        const searchText = `${key} ${venue.name}`.toLowerCase();
        return searchText.includes(focusedValue);
      })
      .map(([key, venue]) => {
        const cost = Number(venue.cost || 0).toLocaleString();
        const income = Number(venue.passiveIncome || 0).toLocaleString();

        return {
          name: `${venue.name} — Rep Req / ${venue.repRequired} - $${cost} — $${income}/hr`.slice(0, 100),
          value: key,
        };
      })
      .slice(0, 25);

    return interaction.respond(choices);
  }

  if (
    interaction.commandName === "hire_venue_staff" &&
    interaction.options.getFocused(true).name === "role"
  ) {
    const { VENUE_STAFF_ROLES } = require("../constants");
    const venueId = interaction.options.getString("venue");
    const venue = venueId
      ? db
          .prepare(
            "SELECT type FROM venues WHERE id = ? AND owner_id = ?",
          )
          .get(venueId, userId)
      : null;

    const choices = Object.keys(VENUE_STAFF_ROLES).map((key) => {
      const role = VENUE_STAFF_ROLES[key];
      const cost = venue ? venueStaffHiringCost(venue.type, key) : role.cost;
      return {
        name: `${role.emoji} ${role.label} — $${cost.toLocaleString()} (+${Math.round(role.incomeBoost * 100)}%)`,
        value: key,
      };
    });

    return interaction.respond(choices);
  }
  if (interaction.commandName === "buy_ticket") {
    const shows = db
      .prepare(
        `
        SELECT
          shows.id,
          shows.owner_id,
          shows.name,
          shows.show_date,
          shows.ticket_price,
          shows.status,
          venues.type,
          venues.base_capacity,
          venues.bar_level,
          venues.security_level,
          venues.production_level,
          users.username AS promoter_name,
          COUNT(show_tickets.id) AS ticket_count,
          MAX(CASE WHEN show_tickets.user_id = ? THEN 1 ELSE 0 END) AS has_ticket
        FROM shows
        JOIN venues ON venues.id = shows.venue_id
        LEFT JOIN users ON users.discord_id = shows.owner_id
        LEFT JOIN show_tickets ON show_tickets.show_id = shows.id
        WHERE shows.name LIKE ?
        GROUP BY shows.id
        ORDER BY shows.show_date ASC
        `,
      )
      .all(userId, `%${focused}%`)
      .filter((show) =>
        canListTicketShow(show, userId, venueCapacity(show)),
      )
      .slice(0, 25);

    return interaction.respond(
      shows.map((show) => ({
        name: (
          `${show.name} — $${show.ticket_price.toLocaleString()} — ` +
          `${show.promoter_name || "Unknown promoter"} — ${show.show_date}`
        ).slice(0, 100),
        value: String(show.id),
      })),
    );
  }
  if (
    [
      "force_run_show",
      "promote_show",
      "add_lineup",
      "hire_show_staff",
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
  if (interaction.commandName === "force_run_show") {
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

module.exports = handleAutocomplete;
