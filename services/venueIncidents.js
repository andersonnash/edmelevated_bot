const { EmbedBuilder } = require("discord.js");
const db = require("../db");
const { postSceneFeed } = require("./sceneFeed");

const VENUE_INCIDENTS = [
  {
    type: "noise_complaint",
    emoji: "🔊",
    title: "Noise Complaint",
    reason:
      "Neighbors filed complaints and the city forced a temporary shutdown.",
    hoursClosed: 3,
  },
  {
    type: "fire_marshal",
    emoji: "🚧",
    title: "Fire Marshal Shutdown",
    reason:
      "The fire marshal found safety issues and temporarily closed the venue.",
    hoursClosed: 6,
  },
  {
    type: "surprise_inspection",
    emoji: "🧯",
    title: "Surprise Inspection",
    reason: "A surprise inspection paused venue operations.",
    hoursClosed: 2,
  },
  {
    type: "police_attention",
    emoji: "🚔",
    title: "Police Attention",
    reason: "Police activity around the venue forced management to lay low.",
    hoursClosed: 4,
  },
];

const VENUE_BOOSTS = [
  {
    type: "local_buzz",
    emoji: "📸",
    title: "Local Buzz",
    reason: "A local influencer posted about the venue.",
    hoursBoosted: 4,
    incomeMultiplier: 1.25,
  },
  {
    type: "packed_bar",
    emoji: "🍻",
    title: "Packed Bar Night",
    reason: "The bar is busier than usual tonight.",
    hoursBoosted: 3,
    incomeMultiplier: 1.35,
  },
  {
    type: "word_of_mouth",
    emoji: "🗣️",
    title: "Word of Mouth",
    reason: "People are talking about the venue around the city.",
    hoursBoosted: 6,
    incomeMultiplier: 1.2,
  },
];

function boostVenueForEvent(venue, event) {
  db.prepare(
    `
    UPDATE venues
    SET boosted_until = datetime('now', ?),
        income_multiplier = ?
    WHERE id = ?
    `,
  ).run(`+${event.hoursBoosted} hours`, event.incomeMultiplier, venue.id);
}

function pickRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function getRandomOpenVenueForOwner(ownerId) {
  const venues = db
    .prepare(
      `
      SELECT *
      FROM venues
      WHERE owner_id = ?
        AND (
          closed_until IS NULL
          OR closed_until <= datetime('now')
        )
      ORDER BY RANDOM()
      LIMIT 1
      `,
    )
    .get(ownerId);

  return venues;
}

function getIncidentChance(venue) {
  const maintenanceLevel = venue.maintenance_level || 0;
  return Math.max(0.02, 0.1 - maintenanceLevel * 0.015);
}

function rollVenueEventForOwner(ownerId) {
  const venue = getRandomOpenVenueForOwner(ownerId);

  if (!venue) return null;

  const roll = Math.random();
  const incidentChance = getIncidentChance(venue);

  if (roll < incidentChance) {
    const event = pickRandom(VENUE_INCIDENTS);
    closeVenueForIncident(venue, event);

    return {
      ownerId,
      venue,
      type: "incident",
      event,
    };
  }

  if (roll < incidentChance + 0.12) {
    const event = pickRandom(VENUE_BOOSTS);
    boostVenueForEvent(venue, event);

    return {
      ownerId,
      venue,
      type: "boost",
      event,
    };
  }

  return null;
}

function buildVenueEventEmbed(venue, type, event) {
  const isIncident = type === "incident";

  return new EmbedBuilder()
    .setColor(isIncident ? 0xff3355 : 0x22c55e)
    .setTitle(
      isIncident
        ? `${event.emoji} Venue Incident`
        : `${event.emoji} Venue Boost`,
    )
    .setDescription(`**${venue.name || "Unknown Venue"}**`)
    .addFields(
      {
        name: event.title || "Venue Event",
        value: event.reason || "Something happened at this venue.",
      },
      {
        name: "Effect",
        value: isIncident
          ? `Closed for **${event.hoursClosed} hours**. Passive income from this venue is paused.`
          : `Income boosted **x${event.incomeMultiplier}** for **${event.hoursBoosted} hours**.`,
      },
      {
        name: "What Now?",
        value: isIncident
          ? "Upgrade venue maintenance to reduce future incident chances."
          : "The owner can use /collect while the boost is active to take advantage of the increased income.",
      },
    );
}

async function processVenueEvents(client) {
  const results = runDailyVenueIncidentCheck();

  for (const result of results) {
    const { ownerId, venue, type, event } = result;
    const embed = buildVenueEventEmbed(venue, type, event);

    // DM owner
    try {
      const user = await client.users.fetch(ownerId);
      await user.send({ embeds: [embed] });
    } catch (error) {
      console.error("Venue event DM failed:", error);
    }

    // Public city feed
    await postSceneFeed(client, embed);
  }

  return results;
}

function closeVenueForIncident(venue, incident) {
  db.prepare(
    `
    UPDATE venues
    SET
      closed_at = CURRENT_TIMESTAMP,
      closed_until = datetime('now', ?),
      closure_reason = ?
    WHERE id = ?
    `,
  ).run(
    `+${incident.hoursClosed} hours`,
    `${incident.emoji} ${incident.title}: ${incident.reason}`,
    venue.id,
  );
}

function getVenueOwners() {
  return db
    .prepare(
      `
      SELECT DISTINCT owner_id
      FROM venues
      WHERE owner_id IS NOT NULL
      `,
    )
    .all()
    .map((row) => row.owner_id);
}

function runDailyVenueIncidentCheck() {
  const ownerIds = getVenueOwners();
  const results = [];

  for (const ownerId of ownerIds) {
    const result = rollVenueEventForOwner(ownerId);

    if (result) {
      results.push(result);
    }
  }

  return results;
}

module.exports = {
  runDailyVenueIncidentCheck,
  rollVenueEventForOwner,
  buildVenueEventEmbed,
  processVenueEvents,
  getIncidentChance,
};
