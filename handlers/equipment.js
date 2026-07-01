const { EmbedBuilder } = require("discord.js");
const db = require("../db");
const { EQUIPMENT_TYPES } = require("../constants");
const { money } = require("../services/formatters");
const {
  equipmentHourlyIncome,
  equipmentPendingIncome,
  hoursSince,
  equipmentMinuteIncome,
} = require("../services/venueEngine");

async function buyEquipment(interaction) {
  const userId = interaction.user.id;
  const type = interaction.options.getString("type");
  const equipment = EQUIPMENT_TYPES[type];

  const user = db
    .prepare("SELECT * FROM users WHERE discord_id = ?")
    .get(userId);

  if (!equipment) {
    return interaction.reply({
      content: "Unknown equipment type.",
      ephemeral: true,
    });
  }

  if (user.cash < equipment.cost) {
    return interaction.reply({
      content: `You need ${money(equipment.cost)}. You currently have ${money(user.cash)}.`,
      ephemeral: true,
    });
  }

  db.prepare(
    `
    UPDATE users
    SET cash = cash - ?
    WHERE discord_id = ?
  `,
  ).run(equipment.cost, userId);

  const existing = db
    .prepare(
      `
      SELECT *
      FROM user_equipment
      WHERE user_id = ?
      AND equipment_type = ?
    `,
    )
    .get(userId, type);
  if (existing) {
    db.prepare(
      `
      UPDATE user_equipment
      SET quantity = quantity + 1
      WHERE id = ?
    `,
    ).run(existing.id);
  } else {
    db.prepare(
      `
    INSERT INTO user_equipment (
      user_id,
      equipment_type,
      name,
      quantity,
      last_collected_at
    )
    VALUES (?, ?, ?, 1, CURRENT_TIMESTAMP);
  `,
    ).run(userId, type, equipment.name);
  }

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎛 EQUIPMENT PURCHASED")
    .setDescription(`**${equipment.name}**`)
    .addFields(
      {
        name: "💰 Cost",
        value: money(equipment.cost),
        inline: true,
      },
      {
        name: "📈 Rental Income",
        value: `${money(equipment.passiveIncome)} / hr`,
        inline: true,
      },
      {
        name: "💼 Passive Income",
        value: "This equipment can now be rented out automatically.",
      },
    )
    .setFooter({
      text: "EDMELEVATED City • Own the gear, rent the gear",
    });

  return interaction.reply({
    embeds: [embed],
  });
}

async function myEquipment(interaction) {
  const userId = interaction.user.id;

  const equipment = db
    .prepare(
      `
      SELECT *
      FROM user_equipment
      WHERE user_id = ?
      ORDER BY hourly_income DESC
    `,
    )
    .all(userId);

  if (!equipment.length) {
    return interaction.reply({
      content: "You don’t own any equipment yet. Try `/buy_equipment`.",
      ephemeral: true,
    });
  }

  const totalHourly = equipment.reduce(
    (sum, item) => sum + equipmentHourlyIncome(item),
    0,
  );

  const totalPending = equipment.reduce(
    (sum, item) => sum + equipmentPendingIncome(item),
    0,
  );

  const list = equipment
    .map((item) => {
      const itemHours = hoursSince(item.last_collected_at);
      const itemDisplayTime =
        itemHours < 1
          ? `${Math.round(itemHours * 60)}m`
          : `${itemHours.toFixed(2)}h`;

      return (
        `🎛 **${item.name}** x${item.quantity}\n` +
        `Rental Income: ${money(equipmentHourlyIncome(item))}/hr\n` +
        `Uncollected: ${money(equipmentPendingIncome(item))}\n` +
        `Rented For: ${itemDisplayTime}`
      );
    })
    .join("\n\n");

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎛 YOUR EQUIPMENT")
    .setDescription(list)
    .addFields({
      name: "📈 Total Rental Income",
      value:
        `${money(totalHourly)}/hr\n` + `Uncollected: ${money(totalPending)}`,
    });
  return interaction.reply({
    embeds: [embed],
  });
}
module.exports = {
  buyEquipment,
  myEquipment,
};
