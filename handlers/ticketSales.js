const { PermissionFlagsBits } = require("discord.js");
const { isBotAdmin } = require("../constants");
const {
  buildTicketSaleEmbed,
  forceRandomTicketSale,
  forceTicketSaleForShow,
  notifyTicketSaleOwner,
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

  const showId = interaction.options.getString("show");
  const result = showId
    ? forceTicketSaleForShow(showId)
    : forceRandomTicketSale();
  if (!result) {
    return interaction.reply({
      content:
        "No eligible upcoming show has room for additional advance sales.",
      ephemeral: true,
    });
  }

  const dmSent = await notifyTicketSaleOwner(interaction.client, result);

  return interaction.reply({
    content: dmSent
      ? `Admin test complete. **${result.show.name}** was updated and the promoter was notified by DM.`
      : `Admin test complete. **${result.show.name}** was updated, but the promoter DM could not be delivered.`,
    embeds: [buildTicketSaleEmbed(result)],
    ephemeral: true,
  });
}

module.exports = {
  testTicketSale,
};
