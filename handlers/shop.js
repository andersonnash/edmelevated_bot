const { EmbedBuilder } = require("discord.js");
const { SHOP_ITEMS } = require("../constants");
const { money } = require("../services/formatters");
const db = require("../db");

function formatCategory(category) {
  if (category === "genre") return "🎧 Genre Titles";
  if (category === "flow") return "🔥 Flow / Fire Titles";
  return "🏷️ Scene Titles";
}

async function shop(interaction) {
  const titleItems = Object.values(SHOP_ITEMS).filter(
    (item) => item.type === "cosmetic_title",
  );

  const categories = {};

  for (const item of titleItems) {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }

    categories[item.category].push(item);
  }

  const embed = new EmbedBuilder()
    .setColor(0xffd000)
    .setTitle("🛒 EDMELEVATED SCENE SHOP")
    .setDescription(
      "Buy cosmetic Scene Titles to customize your profile color and vibe.",
    );

  for (const [category, items] of Object.entries(categories)) {
    embed.addFields({
      name: formatCategory(category),
      value: items
        .map(
          (item) =>
            `**${item.name}** — ${money(item.price)}\n` +
            `${item.description}`,
        )
        .join("\n\n"),
    });
  }

  embed.setFooter({
    text: "Next: /buy_item will let players purchase these titles.",
  });

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}

async function buyItem(interaction) {
  const userId = interaction.user.id;
  const itemKey = interaction.options.getString("item");
  const item = SHOP_ITEMS[itemKey];

  if (!item) {
    return interaction.reply({
      content: "I couldn't find that shop item.",
      ephemeral: true,
    });
  }

  const user = db
    .prepare(
      `
      SELECT discord_id, cash, active_cosmetic_title
      FROM users
      WHERE discord_id = ?
      `,
    )
    .get(userId);

  if (!user) {
    return interaction.reply({
      content: "Run `/profile` first so I can create your city profile.",
      ephemeral: true,
    });
  }

  const owned = db
    .prepare(
      `
      SELECT id
      FROM user_cosmetics
      WHERE user_id = ?
        AND item_key = ?
      `,
    )
    .get(userId, item.key);

  if (owned) {
    return interaction.reply({
      content: `You already own **${item.name}**.`,
      ephemeral: true,
    });
  }

  if ((user.cash || 0) < item.price) {
    return interaction.reply({
      content:
        `You need **${money(item.price)}** to buy **${item.name}**.\n` +
        `You currently have **${money(user.cash || 0)}**.`,
      ephemeral: true,
    });
  }

  const buyItemTransaction = db.transaction(() => {
    db.prepare(
      `
      UPDATE users
      SET cash = cash - ?,
          active_cosmetic_title = ?
      WHERE discord_id = ?
      `,
    ).run(item.price, item.key, userId);

    db.prepare(
      `
      INSERT INTO user_cosmetics (user_id, item_key, item_type)
      VALUES (?, ?, ?)
      `,
    ).run(userId, item.key, item.type);
  });

  buyItemTransaction();

  const embed = new EmbedBuilder()
    .setColor(item.profileColor || 0xffd000)
    .setTitle("🛍️ ITEM PURCHASED")
    .setDescription(`You bought and equipped **${item.name}**.`)
    .addFields(
      {
        name: "🏷️ Scene Title",
        value:
          "```ansi\n" +
          `Title:      ${item.name}\n` +
          `Vibe:       ${item.description}` +
          "```",
      },
      {
        name: "💸 Cost",
        value: money(item.price),
        inline: true,
      },
      {
        name: "💰 Remaining Cash",
        value: money((user.cash || 0) - item.price),
        inline: true,
      },
    )
    .setFooter({
      text: "Run /profile to see your updated scene title and profile color.",
    });

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}

async function equipTitle(interaction) {
  const userId = interaction.user.id;
  const itemKey = interaction.options.getString("title");

  if (itemKey === "none") {
    db.prepare(
      `
      UPDATE users
      SET active_cosmetic_title = NULL
      WHERE discord_id = ?
      `,
    ).run(userId);

    return interaction.reply({
      content: "Your Scene Title has been unequipped.",
      ephemeral: true,
    });
  }

  const item = SHOP_ITEMS[itemKey];

  if (!item || item.type !== "cosmetic_title") {
    return interaction.reply({
      content: "I couldn't find that Scene Title.",
      ephemeral: true,
    });
  }

  const owned = db
    .prepare(
      `
      SELECT id
      FROM user_cosmetics
      WHERE user_id = ?
        AND item_key = ?
      `,
    )
    .get(userId, item.key);

  if (!owned) {
    return interaction.reply({
      content: `You do not own **${item.name}** yet. Buy it from \`/shop\` first.`,
      ephemeral: true,
    });
  }

  db.prepare(
    `
    UPDATE users
    SET active_cosmetic_title = ?
    WHERE discord_id = ?
    `,
  ).run(item.key, userId);

  const embed = new EmbedBuilder()
    .setColor(item.profileColor || 0xffd000)
    .setTitle("🏷️ SCENE TITLE EQUIPPED")
    .setDescription(`You equipped **${item.name}**.`)
    .addFields({
      name: "Profile Preview",
      value:
        "```ansi\n" +
        `Title:      ${item.name}\n` +
        `Vibe:       ${item.description}` +
        "```",
    })
    .setFooter({
      text: "Run /profile to see your updated profile color.",
    });

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}

module.exports = {
  shop,
  buyItem,
  equipTitle,
};
