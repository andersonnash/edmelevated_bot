const cron = require("node-cron");
const db = require("../db");

const { runShowById } = require("./showRunner");
const { EmbedBuilder } = require("discord.js");
const { postSceneFeed } = require("./sceneFeed");
const { processVenueEvents } = require("./venueIncidents");

const SCENE_FEED_CHANNEL_ID = process.env.SCENE_FEED_CHANNEL_ID;

function startShowScheduler(client) {
  console.log("Show scheduler started.");

  cron.schedule("0 * * * *", async () => {
    const today = new Date().toISOString().slice(0, 10);

    const shows = db
      .prepare(
        `
        SELECT id
        FROM shows
        WHERE status = 'upcoming'
        AND show_date <= ?
      `,
      )
      .all(today);

    for (const show of shows) {
      const result = await runShowById(show.id);

      if (!result) continue;

      const embed = new EmbedBuilder()
        .setColor(result.netProfit >= 0 ? 0x00ff88 : 0xff3355)
        .setTitle("🎧 EDMELEVATED SHOW REPORT")
        .setDescription(`**${result.show.name}**`)
        .addFields(
          {
            name: "📍 Event",
            value:
              `**Venue:** ${result.show.venue_name}\n` +
              `**Dynamic Event:** ${result.event.title}`,
          },
          {
            name: "👥 Attendance",
            value:
              `**Real Tickets:** ${result.tickets.length}\n` +
              `**Walk-ins:** ${result.adjustedWalkins}\n` +
              `**Total:** ${result.totalAttendance}`,
          },
          {
            name: "💸 Money",
            value:
              `**Ticket Revenue:** $${result.paidRevenue}\n` +
              `**Walk-in Revenue:** $${result.simulatedRevenue}\n` +
              `**Upgrade Bonus:** $${result.bonusRevenue}\n` +
              `**Staff Cost:** -$${result.staffCost}\n` +
              `**Lineup Cost:** -$${result.lineupCost}\n` +
              `**Operating Cost:** -$${result.operatingCost}\n` +
              `**Net Profit:** $${result.netProfit}`,
          },
          {
            name: "⭐ Show Rating",
            value:
              `**Overall:** ${result.rating.stars}/5 ★ (${result.rating.overallScore}/100)\n` +
              `**Attendance:** ${result.rating.attendance}/100\n` +
              `**Profitability:** ${result.rating.profitability}/100\n` +
              `**Production:** ${result.rating.production}/100\n` +
              `**Lineup:** ${result.rating.lineup}/100\n` +
              `**Staffing:** ${result.rating.staffing}/100\n\n` +
              `*“${result.rating.reaction}”*`,
          },
          {
            name: "⭐ Rewards",
            value:
              `**Base Reputation:** +${result.baseReputationGain}\n` +
              `**Rating Bonus:** +${result.rating.reputationBonus}\n` +
              `**Total Reputation:** +${result.reputationGain}`,
          },
        )
        .setFooter({
          text:
            result.netProfit >= 0
              ? "Use /collect_show to claim your profit"
              : "You took a loss on this one",
        });

      await postSceneFeed(client, SCENE_FEED_CHANNEL_ID, {
        embeds: [embed],
      });
    }
  });

  cron.schedule(
    "0 0,6,12,18 * * *",
    async () => {
      await processVenueEvents(client);
    },
    {
      timezone: "America/Denver",
    },
  );
}

module.exports = {
  startShowScheduler,
};
