const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");
const db = require("../db");
const { EQUIPMENT_TYPES } = require("../constants");
const { money } = require("../services/formatters");
const {
  equipmentHourlyIncome,
  equipmentPendingIncome,
  hoursSince,
} = require("../services/venueEngine");
const { storedQuantity } = require("../services/equipmentRules");
const { numberOwnedVenues } = require("../services/venueDisplayRules");

function installedQuantity(userId, type) {
  return Number(
    db
      .prepare(
        `SELECT COALESCE(SUM(quantity), 0) AS quantity
         FROM venue_equipment WHERE user_id = ? AND equipment_type = ?`,
      )
      .get(userId, type).quantity || 0,
  );
}

function settleEquipmentRental(item) {
  const alreadyAccrued = Number(item.accrued_income || 0);
  const generated = Math.max(
    0,
    equipmentPendingIncome(item) - alreadyAccrued,
  );
  db.prepare(
    `UPDATE user_equipment
     SET accrued_income = COALESCE(accrued_income, 0) + ?,
         last_collected_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
  ).run(generated, item.id);
}

function equipmentRows(userId) {
  return db
    .prepare(
      `SELECT * FROM user_equipment
       WHERE user_id = ? ORDER BY id ASC`,
    )
    .all(userId);
}

function allocationRows(userId) {
  return db
    .prepare(
      `SELECT venue_equipment.*, venues.name AS venue_name, venues.type AS venue_type
       FROM venue_equipment
       JOIN venues ON venues.id = venue_equipment.venue_id
       WHERE venue_equipment.user_id = ?
       ORDER BY venues.id, venue_equipment.id`,
    )
    .all(userId);
}

function equipmentSummaryEmbed(userId) {
  const equipment = equipmentRows(userId);
  const allocations = allocationRows(userId);
  const venues = numberOwnedVenues(
    db
      .prepare("SELECT id, name, type FROM venues WHERE owner_id = ? ORDER BY id")
      .all(userId),
  );
  const venueLabels = new Map(
    venues.map((venue) => [
      venue.id,
      `${venue.name} #${venue.ownerVenueTypeNumber}`,
    ]),
  );

  const list = equipment
    .map((item) => {
      const type = EQUIPMENT_TYPES[item.equipment_type];
      const installed = allocations
        .filter((row) => row.equipment_type === item.equipment_type)
        .reduce((sum, row) => sum + Number(row.quantity || 0), 0);
      const stored = storedQuantity(item.quantity, installed);
      const locations = allocations
        .filter((row) => row.equipment_type === item.equipment_type)
        .map(
          (row) =>
            `↳ ${venueLabels.get(row.venue_id) || row.venue_name}: x${row.quantity}`,
        );

      return [
        `🎛 **${item.name}** — Owned: **${item.quantity}**`,
        `Stored: **${stored}** • Installed: **${installed}**`,
        `Rental Income: **${money(type.passiveIncome * stored)}/hr**`,
        `Installed Effect (each): **+${money(type.installedIncome)}/hr**, **+${Math.round(type.attendanceBonus * 100)}% attendance**, **+${type.productionBonus} production**`,
        ...locations,
        `Uncollected Rentals: **${money(equipmentPendingIncome(item))}**`,
      ].join("\n");
    })
    .join("\n\n");

  const totalRentalHourly = equipment.reduce(
    (sum, item) => sum + equipmentHourlyIncome(item),
    0,
  );
  const totalPending = equipment.reduce(
    (sum, item) => sum + equipmentPendingIncome(item),
    0,
  );

  return new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎛 YOUR EQUIPMENT")
    .setDescription(list)
    .addFields({
      name: "📈 Stored Gear Rentals",
      value: `${money(totalRentalHourly)}/hr\nUncollected: ${money(totalPending)}`,
    })
    .setFooter({
      text: venues.length
        ? "Manage gear to install it at a venue or return it to rentals."
        : "Buy a venue before installing gear. Stored gear continues earning rentals.",
    });
}

function manageButton(disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("equipment_manage")
      .setLabel("Manage Gear")
      .setEmoji("🎛️")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
  );
}

async function buyEquipment(interaction) {
  const userId = interaction.user.id;
  const type = interaction.options.getString("type");
  const equipment = EQUIPMENT_TYPES[type];
  const user = db
    .prepare("SELECT * FROM users WHERE discord_id = ?")
    .get(userId);

  if (!equipment) {
    return interaction.reply({ content: "Unknown equipment type.", ephemeral: true });
  }
  if (user.cash < equipment.cost) {
    return interaction.reply({
      content: `You need ${money(equipment.cost)}. You currently have ${money(user.cash)}.`,
      ephemeral: true,
    });
  }

  const transaction = db.transaction(() => {
    const existing = db
      .prepare(
        `SELECT * FROM user_equipment
         WHERE user_id = ? AND equipment_type = ?`,
      )
      .get(userId, type);
    if (existing) settleEquipmentRental(existing);

    db.prepare("UPDATE users SET cash = cash - ? WHERE discord_id = ?").run(
      equipment.cost,
      userId,
    );
    if (existing) {
      db.prepare("UPDATE user_equipment SET quantity = quantity + 1 WHERE id = ?").run(
        existing.id,
      );
    } else {
      db.prepare(
        `INSERT INTO user_equipment
         (user_id, equipment_type, name, quantity, last_collected_at)
         VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP)`,
      ).run(userId, type, equipment.name);
    }
  });
  transaction();

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎛 EQUIPMENT PURCHASED")
    .setDescription(`**${equipment.name}**`)
    .addFields(
      { name: "💰 Cost", value: money(equipment.cost), inline: true },
      {
        name: "📈 Stored Rental Income",
        value: `${money(equipment.passiveIncome)} / hr`,
        inline: true,
      },
      {
        name: "🏟 Installed Effect",
        value:
          `+${money(equipment.installedIncome)}/hr for its venue\n` +
          `+${Math.round(equipment.attendanceBonus * 100)}% show attendance • +${equipment.productionBonus} production`,
      },
    )
    .setFooter({ text: "Use /my_equipment to manage where your gear works." });

  return interaction.reply({ embeds: [embed] });
}

async function myEquipment(interaction) {
  const userId = interaction.user.id;
  if (!equipmentRows(userId).length) {
    return interaction.reply({
      content: "You don’t own any equipment yet. Try `/buy_equipment`.",
      ephemeral: true,
    });
  }
  const hasVenues = db
    .prepare("SELECT 1 FROM venues WHERE owner_id = ? LIMIT 1")
    .get(userId);
  return interaction.reply({
    embeds: [equipmentSummaryEmbed(userId)],
    components: [manageButton(!hasVenues)],
  });
}

async function handleManageButton(interaction) {
  const rows = equipmentRows(interaction.user.id);
  if (!rows.length) {
    return interaction.reply({ content: "You do not own any gear.", ephemeral: true });
  }
  const select = new StringSelectMenuBuilder()
    .setCustomId("equipment_type")
    .setPlaceholder("Choose gear to manage")
    .addOptions(
      rows.slice(0, 25).map((item) => ({
        label: item.name.slice(0, 100),
        description: `${item.quantity} owned • ${installedQuantity(interaction.user.id, item.equipment_type)} installed`,
        value: item.equipment_type,
      })),
    );
  return interaction.reply({
    content: "Choose the equipment you want to install, move, or return to rentals.",
    components: [new ActionRowBuilder().addComponents(select)],
    ephemeral: true,
  });
}

async function handleEquipmentTypeSelect(interaction) {
  const userId = interaction.user.id;
  const type = interaction.values[0];
  const item = db
    .prepare("SELECT * FROM user_equipment WHERE user_id = ? AND equipment_type = ?")
    .get(userId, type);
  if (!item || !EQUIPMENT_TYPES[type]) {
    return interaction.update({ content: "That equipment is no longer available.", components: [] });
  }
  const venues = numberOwnedVenues(
    db
      .prepare("SELECT id, name, type FROM venues WHERE owner_id = ? ORDER BY id LIMIT 25")
      .all(userId),
  );
  if (!venues.length) {
    return interaction.update({ content: "Buy a venue before installing gear.", components: [] });
  }
  const installed = installedQuantity(userId, type);
  const stored = storedQuantity(item.quantity, installed);
  const venueSelect = new StringSelectMenuBuilder()
    .setCustomId(`equipment_venue:${type}`)
    .setPlaceholder(stored > 0 ? "Choose a venue to install one" : "Return a copy before installing elsewhere")
    .setDisabled(stored <= 0)
    .addOptions(
      venues.map((venue) => ({
        label: `${venue.name} #${venue.ownerVenueTypeNumber}`.slice(0, 100),
        value: String(venue.id),
      })),
    );
  const allocations = allocationRows(userId).filter(
    (row) => row.equipment_type === type,
  );
  const returnSelect = allocations.length
    ? new StringSelectMenuBuilder()
        .setCustomId(`equipment_return_venue:${type}`)
        .setPlaceholder("Return one copy from a venue")
        .addOptions(
          allocations.map((row) => ({
            label: `${row.venue_name} — ${row.quantity} installed`.slice(0, 100),
            value: String(row.venue_id),
          })),
        )
    : null;
  return interaction.update({
    content: `**${item.name}** — ${stored} stored, ${installed} installed.`,
    components: [
      new ActionRowBuilder().addComponents(venueSelect),
      ...(returnSelect
        ? [new ActionRowBuilder().addComponents(returnSelect)]
        : []),
    ],
  });
}

async function handleVenueSelect(interaction) {
  const userId = interaction.user.id;
  const type = interaction.customId.split(":")[1];
  const venueId = Number(interaction.values[0]);
  const item = db
    .prepare("SELECT * FROM user_equipment WHERE user_id = ? AND equipment_type = ?")
    .get(userId, type);
  const venue = db
    .prepare("SELECT * FROM venues WHERE id = ? AND owner_id = ?")
    .get(venueId, userId);
  if (!item || !venue || !EQUIPMENT_TYPES[type]) {
    return interaction.update({ content: "That equipment or venue is no longer available.", components: [] });
  }

  const transaction = db.transaction(() => {
    settleEquipmentRental(item);
    const installed = installedQuantity(userId, type);
    const stored = storedQuantity(item.quantity, installed);
    if (stored <= 0) throw new Error("NO_STORED_GEAR");
    db.prepare(
      `INSERT INTO venue_equipment (user_id, venue_id, equipment_type, quantity)
       VALUES (?, ?, ?, 1)
       ON CONFLICT(venue_id, equipment_type)
       DO UPDATE SET quantity = quantity + 1`,
    ).run(userId, venueId, type);
  });

  try {
    transaction();
  } catch (error) {
    if (error.message === "NO_STORED_GEAR") {
      return interaction.update({
        content: "Every copy is installed. Return one from its current venue before installing it elsewhere.",
        components: [],
      });
    }
    throw error;
  }
  return interaction.update({
    content: `Installed **${EQUIPMENT_TYPES[type].name}** at **${venue.name}**.`,
    embeds: [equipmentSummaryEmbed(userId)],
    components: [],
  });
}

async function handleReturnSelect(interaction) {
  const userId = interaction.user.id;
  const type = interaction.customId.split(":")[1];
  const venueId = Number(interaction.values[0]);
  const item = db
    .prepare("SELECT * FROM user_equipment WHERE user_id = ? AND equipment_type = ?")
    .get(userId, type);
  const allocation = db
    .prepare(
      `SELECT * FROM venue_equipment
       WHERE user_id = ? AND equipment_type = ? AND venue_id = ?`,
    )
    .get(userId, type, venueId);
  if (!item || !allocation) {
    return interaction.update({ content: "No installed copy was found.", components: [] });
  }
  const transaction = db.transaction(() => {
    settleEquipmentRental(item);
    if (allocation.quantity <= 1) {
      db.prepare("DELETE FROM venue_equipment WHERE id = ?").run(allocation.id);
    } else {
      db.prepare("UPDATE venue_equipment SET quantity = quantity - 1 WHERE id = ?").run(allocation.id);
    }
  });
  transaction();
  return interaction.update({
    content: `Returned one **${EQUIPMENT_TYPES[type].name}** to rentals.`,
    embeds: [equipmentSummaryEmbed(userId)],
    components: [],
  });
}

module.exports = {
  buyEquipment,
  myEquipment,
  handleManageButton,
  handleEquipmentTypeSelect,
  handleVenueSelect,
  handleReturnSelect,
};
