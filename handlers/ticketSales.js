const { PermissionFlagsBits } = require("discord.js");
const { isBotAdmin } = require("../constants");
const {
  buildTicketSaleEmbed,
  forceTicketSaleForOwner,
} = require("../services/ticketSales");

async function testTicketSale(interaction) {
  if (!isBotAdmin(interaction.user.id)) {
    return interaction.reply({
      content: "Bot admin only.",
      ephemeral: true,
    });
  }

  if (
    !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
  ) {
    return interaction.reply({
      content: "Server administrator permission is required.",
      ephemeral: true,
    });
  }

  const result = forceTicketSaleForOwner(interaction.user.id);
  if (!result) {
    return interaction.reply({
      content:
        "No eligible upcoming show has room for additional advance sales.",
      ephemeral: true,
    });
  }

  return interaction.reply({
    embeds: [buildTicketSaleEmbed(result)],
    ephemeral: true,
  });
}

module.exports = {
  testTicketSale,
};
