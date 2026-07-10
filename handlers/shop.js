const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ButtonInteraction } = require("discord.js");
const { SHOP_ITEMS } = require("../constants");
const { money } = require("../services/formatters");
const db = require("../db");

function formatCategory(category) {
  if (category === "genre") return "🎧 Genre Titles";
  if (category === "flow") return "🔥 Flow / Fire Titles";
  return "🏷️ Scene Titles";
}

function getShopTitleItems() {
  return Object.values(SHOP_ITEMS).filter(
    (item) => item.type === "cosmetic_title",
  );
}

function getCategoryItems(category) {
  return getShopTitleItems().filter((item) => item.category === category);
}

function getOwnedKeys(userId) {
  const ownedRows = db
    .prepare(
      `
      SELECT item_key
      FROM user_cosmetics
      WHERE user_id = ?
      `,
    )
    .all(userId);

  return new Set(ownedRows.map((row) => row.item_key));
}

function formatShopStatus(item, user, ownedKeys) {
  if (user?.active_cosmetic_title === item.key) {
    return "🟢 Equipped";
  }

  if (ownedKeys.has(item.key)) {
    return "✅ Owned";
  }

  return `💸 ${money(item.price)}`;
}

function formatShopItem(item, user, ownedKeys) {
  const status = formatShopStatus(item, user, ownedKeys);
  const emoji = item.profileEmoji || "🏷️";
  const accent = item.profileAccent ? `\n*${item.profileAccent}*` : "";

  return (
    `**${emoji} ${item.name}** — ${status}\n` + `${item.description}` + accent
  );
}

function getShopUser(userId) {
  return db
    .prepare(
      `
      SELECT discord_id, cash, active_cosmetic_title
      FROM users
      WHERE discord_id = ?
      `,
    )
    .get(userId);
}

function buildShopHomeEmbed(user = null) {
  const genreCount = getCategoryItems("genre").length;
  const flowCount = getCategoryItems("flow").length;

  const embed = new EmbedBuilder()
    .setColor(0xffd000)
    .setTitle("🛒 EDMELEVATED SCENE SHOP")
    .setDescription(
      "Welcome to the Scene Shop.\n\n" +
        "Buy cosmetic **Scene Titles** to customize your `/profile` with different colors, emojis, and scene identity.\n\n" +
        "Choose a category below to browse titles.",
    )
    .addFields(
      {
        name: "🎧 Genre Titles",
        value: `${genreCount} music identity titles. DNB, house, techno, trance, bass, and more.`,
        inline: false,
      },
      {
        name: "🔥 Flow / Fire Titles",
        value: `${flowCount} scene identity titles for flow artists, fire circle regulars, orbit wizards, and glowstick gremlins.`,
        inline: false,
      },
    )
    .setFooter({
      text: "Buying a title automatically equips it. Owned titles can be equipped from the shop.",
    });

  if (user) {
    embed.addFields({
      name: "💰 Wallet",
      value: money(user.cash || 0),
      inline: true,
    });
  }

  return embed;
}

function buildShopCategoryRows() {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("shop_category_genre")
        .setLabel("Genre Titles")
        .setEmoji("🎧")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("shop_category_flow")
        .setLabel("Flow / Fire Titles")
        .setEmoji("🔥")
        .setStyle(ButtonStyle.Primary),
    ),
  ];
}

async function shop(interaction) {
  const userId = interaction.user.id;
  const user = getShopUser(userId);

  if (!user) {
    return interaction.reply({
      content: "Run `/profile` first so I can create your city profile.",
      ephemeral: true,
    });
  }

  return interaction.reply({
    embeds: [buildShopHomeEmbed(user)],
    components: buildShopCategoryRows(),
    ephemeral: true,
  });
}

function buildShopCategoryEmbed(category, user, ownedKeys) {
  const items = getCategoryItems(category);
  const activeItem = SHOP_ITEMS[user.active_cosmetic_title];

  const embed = new EmbedBuilder()
    .setColor(0xffd000)
    .setTitle(formatCategory(category))
    .setDescription(
      `**Wallet:** ${money(user.cash || 0)}\n` +
        `**Owned:** ${items.filter((item) => ownedKeys.has(item.key)).length}/${items.length}\n` +
        `**Equipped:** ${activeItem?.name || "None"}\n\n` +
        "Click a title below to buy or equip it.",
    )
    .addFields({
      name: "Available Titles",
      value: items
        .map((item) => formatShopItem(item, user, ownedKeys))
        .join("\n\n"),
      inline: false,
    })
    .setFooter({
      text: "Unowned titles are purchased and equipped. Owned titles are equipped.",
    });

  return embed;
}

function buildShopItemRows(category, user, ownedKeys) {
  const items = getCategoryItems(category);
  const rows = [];
  let currentRow = new ActionRowBuilder();

  items.forEach((item, index) => {
    if (index > 0 && index % 5 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }

    const isEquipped = user.active_cosmetic_title === item.key;
    const isOwned = ownedKeys.has(item.key);
    const canAfford = (user.cash || 0) >= item.price;

    let label;

    if (isEquipped) {
      label = `${item.name} — Equipped`;
    } else if (isOwned) {
      label = `${item.name} — Equip`;
    } else {
      label = `${item.name} — ${money(item.price)}`;
    }

    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`shop_buy_${item.key}`)
        .setLabel(label.slice(0, 80))
        .setStyle(isOwned ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(isEquipped || (!isOwned && !canAfford)),
    );
  });

  if (currentRow.components.length > 0) {
    rows.push(currentRow);
  }

  rows.push(
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("shop_home")
        .setLabel("Back to Shop")
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary),
    ),
  );

  return rows;
}

async function showShopCategory(interaction, category) {
  const userId = interaction.user.id;
  const user = getShopUser(userId);

  if (!user) {
    return interaction.reply({
      content: "Run `/profile` first so I can create your city profile.",
      ephemeral: true,
    });
  }

  const ownedKeys = getOwnedKeys(userId);

  return interaction.update({
    embeds: [buildShopCategoryEmbed(category, user, ownedKeys)],
    components: buildShopItemRows(category, user, ownedKeys),
  });
}

function buildShopAfterActionRows(category) {
  return [
    new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`shop_category_${category}`)
        .setLabel(`Back to ${formatCategory(category).replace(/^.+? /, "")}`)
        .setEmoji("⬅️")
        .setStyle(ButtonStyle.Secondary),

      new ButtonBuilder()
        .setCustomId("shop_home")
        .setLabel("Back to Shop")
        .setEmoji("🛒")
        .setStyle(ButtonStyle.Secondary),
    ),
  ];
}

async function buyOrEquipItemByKey(interaction, itemKey) {
  const userId = interaction.user.id;
  const item = SHOP_ITEMS[itemKey];

  if (!item || item.type !== "cosmetic_title") {
    return interaction.reply({
      content: "I couldn't find that shop item.",
      ephemeral: true,
    });
  }

  const user = getShopUser(userId);

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

  if (user.active_cosmetic_title === item.key) {
    return interaction.reply({
      content: `**${item.name}** is already equipped.`,
      ephemeral: true,
    });
  }

  let actionLabel;
  let remainingCash = user.cash || 0;

  if (owned) {
    db.prepare(
      `
      UPDATE users
      SET active_cosmetic_title = ?
      WHERE discord_id = ?
      `,
    ).run(item.key, userId);

    actionLabel = "🏷️ SCENE TITLE EQUIPPED";
  } else {
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

    remainingCash = (user.cash || 0) - item.price;
    actionLabel = "🛍️ ITEM PURCHASED";
  }

  const embed = new EmbedBuilder()
    .setColor(item.profileColor || 0xffd000)
    .setTitle(actionLabel)
    .setDescription(
      `**${item.profileEmoji || "🏷️"} ${item.name}** is now active.`,
    )
    .addFields(
      {
        name: "Vibe",
        value: item.description,
        inline: false,
      },
      {
        name: "Profile Accent",
        value: item.profileAccent || "Scene identity updated.",
        inline: false,
      },
      {
        name: "💰 Remaining Cash",
        value: money(remainingCash),
        inline: true,
      },
    )
    .setFooter({
      text: "Run /profile to see your updated scene title.",
    });

  if (interaction.isButton?.()) {
    return interaction.update({
      embeds: [embed],
      components: buildShopAfterActionRows(item.category),
    });
  }

  return interaction.reply({
    embeds: [embed],
    ephemeral: true,
  });
}

async function buyItem(interaction) {
  const itemKey = interaction.options.getString("item");
  return buyOrEquipItemByKey(interaction, itemKey);
}

async function handleShopButton(interaction) {
  if (interaction.customId === "shop_home") {
    const user = getShopUser(interaction.user.id);

    return interaction.update({
      embeds: [buildShopHomeEmbed(user)],
      components: buildShopCategoryRows(),
    });
  }

  if (interaction.customId.startsWith("shop_category_")) {
    const category = interaction.customId.replace("shop_category_", "");

    if (!["genre", "flow"].includes(category)) {
      return interaction.reply({
        content: "Unknown shop category.",
        ephemeral: true,
      });
    }

    return showShopCategory(interaction, category);
  }

  if (interaction.customId.startsWith("shop_buy_")) {
    const itemKey = interaction.customId.replace("shop_buy_", "");
    return buyOrEquipItemByKey(interaction, itemKey);
  }

  return interaction.reply({
    content: "Unknown shop action.",
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
  handleShopButton,
};
