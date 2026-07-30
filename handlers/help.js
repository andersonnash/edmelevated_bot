const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const CITY_SIGNAL_COLOR = 0x22d3ee;
const CITY_SIGNAL_FOOTER =
  "Start with /profile, then follow /journey";

function mainHelpEmbed() {
  return new EmbedBuilder()
    .setColor(CITY_SIGNAL_COLOR)
    .setTitle("EDM ELEVATED // CITY SIGNAL")
    .setDescription(
      "**WELCOME TO THE CITY**\n\n" +
        "You are not here just to build a balance. You are here to build a name, create nights people remember, and change the sound of the city.",
    )
    .addFields(
      {
        name: "01 // BUILD YOUR SOUND",
        value:
          "Start unknown. Find gear, take bookings, earn trust, and develop an identity behind the decks.",
      },
      {
        name: "02 // CREATE THE NIGHT",
        value:
          "Secure a room. Build the lineup. Move tickets. Staff the floor. Open the doors and live with the result.",
      },
      {
        name: "03 // SHAPE THE CITY",
        value:
          "Own spaces, strengthen scenes, create opportunities, and leave a history other players can feel.",
      },
      {
        name: "START HERE",
        value:
          "`/profile` opens your city file and identifies your next move.\n" +
          "`/journey` guides your opening path from borrowed gear to your own venue.",
      },
      {
        name: "EXPLORE THE CITY",
        value:
          "Use the controls below to tune into shows, venues, artists, crews, equipment, progression, and the wider scene.",
      },
    )
    .setFooter({
      text: CITY_SIGNAL_FOOTER,
    });
}

function categoryEmbed(category) {
  const embeds = {
    shows: new EmbedBuilder()
      .setColor(0xc084fc)
      .setTitle("🎵 Shows Commands")
      .setDescription("Create, promote, staff, and settle your shows.")
      .addFields(
        {
          name: "`/create_show`",
          value:
            "Create a scheduled show with your choice of genre, ticket price, and optional custom name.",
        },
        {
          name: "`/my_shows`",
          value:
            "View upcoming shows and saved ratings for completed shows. Use the buttons to promote, view lineup, hire staff, or collect payouts.",
        },
        {
          name: "`/promote_show`",
          value:
            "Promote one of your upcoming shows for more projected walk-ins.",
        },
        {
          name: "`/add_lineup`",
          value: "Add another Discord user as a DJ on your show lineup.",
        },
        {
          name: "`/hire_staff`",
          value:
            "Hire another user as show staff. Show staff temporarily boost venue income until the show runs.",
        },
        {
          name: "`/show_lineup`",
          value: "View DJs and staff assigned to a show.",
        },
        {
          name: "`/buy_ticket`",
          value: "Buy a ticket to an upcoming show.",
        },
        {
          name: "`/collect_show`",
          value:
            "Collect profits and settle payouts. Completed show reports rate attendance, profit, production, lineup, and staffing.",
        },
      ),

    games: new EmbedBuilder()
      .setColor(0xec4899)
      .setTitle("🎮 Games & Side Activities")
      .setDescription(
        "Interactive activities for earning rewards, taking risks, building Scene Reputation, and boosting shows.",
      )
      .addFields(
        {
          name: "`/underground_run` • Always Available",
          value:
            "Choose one of several story scenarios, watch it unfold, then make one safe, balanced, or risky decision for the final reward. The run ends after that scenario. Daily diminishing returns keep it playable without replacing jobs, bookings, or shows.",
        },
        {
          name: "`/crate_dig`",
          value:
            "Dig through crates for random cash rewards. Some pulls can also boost projected demand for your next upcoming show.",
        },
        {
          name: "`/rave_story`",
          value:
            "Play a short choice-based scene story. Good for XP, Scene Reputation, and a little extra cash.",
        },
        {
          name: "`/street_team`",
          value:
            "Promote your next upcoming show, add projected walk-ins, earn Scene Reputation, and pick up some cash.",
        },
        {
          name: "When to use these",
          value:
            "Use side activities while saving for equipment, venues, upgrades, or while waiting for show day.",
        },
      )
      .setFooter({
        text: "Tip: Side activities are quick boosts. Venues and shows are the bigger long-term money path.",
      }),

    venues: new EmbedBuilder()
      .setColor(0x38bdf8)
      .setTitle("🏟 Venues Commands")
      .setDescription(
        "Buy venues, upgrade departments, insure venues, hire permanent staff, host shows, and build venue income.",
      )
      .addFields(
        {
          name: "How venues make money",
          value:
            "Venues generate venue income over time.\n" +
            "Income builds while you're away until you collect it.\n" +
            "Bigger venues earn more per hour and can host larger shows.",
        },
        {
          name: "Venue upgrades",
          value:
            "`/upgrade_venue` improves specific venue departments:\n\n" +
            "🍺 **Bar** — increases venue income\n" +
            "🚪 **Security** — increases venue capacity\n" +
            "🎛 **Production** — boosts show attendance\n\n" +
            "Prices scale with the venue and increase as that department levels up.",
        },
        {
          name: "Venue staff vs show staff",
          value:
            "`/hire_venue_staff` = permanent staff for one venue. They increase that venue's income, and hiring prices scale with venue size.\n" +
            "`/hire_staff` = temporary show staff. They boost venue income only until that show runs.",
        },
        {
          name: "`/venue_insurance`",
          value:
            "Buys 48 hours of coverage for a venue.\n" +
            "The price scales with venue size. Coverage reduces incident risk by 35% and closure time by 50%.",
        },
        {
          name: "`/buy_venue`",
          value: "Purchase a venue and start building venue income.",
        },
        {
          name: "`/my_venues`",
          value:
            "View your owned venues, income, capacity, staff, upgrades, insurance, active boosts, and uncollected earnings.",
        },
        {
          name: "`/upgrade_venue`",
          value: "Upgrade Bar, Security, or Production for one of your venues.",
        },
        {
          name: "`/hire_venue_staff`",
          value:
            "Hire permanent staff members for a venue to increase its income.",
        },
        {
          name: "`/collect`",
          value: "Collect passive income from venues and equipment.",
        },
      )
      .setFooter({
        text: "Tip: Venue staff are permanent. Show staff are temporary and tied to upcoming shows.",
      }),

    djs: new EmbedBuilder()
      .setColor(0xa78bfa)
      .setTitle("🎧 DJs & Lineup Commands")
      .setDescription(
        "Take DJ bookings, add DJs to shows, view lineups, and track who is building a name in the scene.",
      )
      .addFields(
        {
          name: "`/bookings`",
          value:
            "Career bookings are one-time milestones unlocked by DJ reputation and repeatable-gig experience. Every booking has its own choices. Repeatable gigs share a 6-hour cooldown and a limit of 3 per day.",
        },
        {
          name: "`/add_lineup`",
          value:
            "Add another Discord user as a DJ on one of your upcoming shows.",
        },
        {
          name: "`/show_lineup`",
          value: "View the DJs and staff assigned to a show.",
        },
        {
          name: "`/dj_profile`",
          value:
            "View another user's DJ Reputation, level, Completed Gigs, and booking fee.",
        },
        {
          name: "`/top_djs`",
          value: "View the top DJs in the city.",
        },
        {
          name: "How DJs fit into shows",
          value:
            "DJs can build their own career through `/bookings` after buying gear.\n" +
            "Promoters can use `/add_lineup` before showtime to build a lineup around an event.",
        },
      ),

    staff: new EmbedBuilder()
      .setColor(0xf97316)
      .setTitle("👷 Staff Commands")
      .setDescription(
        "Show staff help events run better and earn payouts when owners settle shows.",
      )
      .addFields(
        {
          name: "`/hire_staff`",
          value:
            "Hire another user as show staff for one of your upcoming shows. Each hired staff member gives a temporary venue income boost until showtime.",
        },
        {
          name: "`/my_jobs`",
          value:
            "View shows where you were hired as staff. Status moves from assigned, to completed, to paid.",
        },
        {
          name: "How staff payouts work",
          value:
            "Staff do not collect payouts directly.\n" +
            "When the show owner runs `/collect_show`, the completed show is settled and staff/DJ payouts are marked paid.",
        },
      ),

    equipment: new EmbedBuilder()
      .setColor(0x14b8a6)
      .setTitle("🎛 Equipment Commands")
      .setDescription(
        "Buy gear, build equipment rental income, and stack earnings while you work toward venues.",
      )
      .addFields(
        {
          name: "Why equipment matters",
          value:
            "Equipment is the easiest way for new players to start earning equipment rental income.\n" +
            "Multiple copies increase hourly rental income.\n" +
            "Better gear earns more over time.",
        },
        {
          name: "Equipment vs venues",
          value:
            "Equipment is cheaper and helps you get moving early.\n" +
            "Venues cost more, but they unlock shows, staff, upgrades, insurance, and bigger long-term income.",
        },
        {
          name: "`/buy_equipment`",
          value: "Purchase gear that generates equipment rental income.",
        },
        {
          name: "`/my_equipment`",
          value:
            "View your owned equipment, hourly income, and uncollected rental income.",
        },
        {
          name: "`/collect`",
          value: "Collect passive income from equipment and venues.",
        },
      )
      .setFooter({
        text: "Tip: If you are new, buying your first piece of equipment is usually the fastest path to equipment rental income.",
      }),

    economy: new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("💵 Economy Commands")
      .setDescription(
        "Earn cash, collect passive income, settle show payouts, and track progress.",
      )
      .addFields(
        {
          name: "`/profile`",
          value:
            "View your cash, level, XP, Scene Reputation, venues, equipment, passive income, and next objective.",
        },
        {
          name: "`/work`",
          value:
            "Automatically play a random scene-work scenario and earn reliable cash and XP. All work shares one 45-minute cooldown.",
        },
        {
          name: "`/collect`",
          value: "Collect passive income from venues and equipment.",
        },
        {
          name: "`/collect_show`",
          value:
            "Owner collects profits from one completed show. This also settles DJ and staff payouts for that show.",
        },
        {
          name: "`/leaderboard`",
          value: "View the top players in the city.",
        },
      ),

    progression: new EmbedBuilder()
      .setColor(0xfacc15)
      .setTitle("🌟 Progression Commands")
      .setDescription(
        "Track your level, Scene Reputation, roles, and position in the city.",
      )
      .addFields(
        {
          name: "`/journey` • Start Here",
          value:
            "Follow the one-time opening path: buy a controller, complete Open Decks, build community momentum, and run a borrowed-venue showcase that funds your move toward Garage Party.",
        },
        {
          name: "How progression works",
          value:
            "**XP & Level** — unlimited player progression; activities and shows award XP.\n" +
            "**Scene Reputation** — citywide credibility used for venue and progression unlocks.\n" +
            "**DJ Reputation** — artist credibility that raises DJ status and booking value.\n" +
            "**Completed Gigs** — bookings and show-lineup appearances; also raises booking value.\n" +
            "**Show Rating** — event quality across attendance, profit, production, lineup, and staffing.\n" +
            "**Venue Reputation** — planned as a separate future venue measurement; not yet tracked.\n" +
            "**Cash** — buys equipment, venues, upgrades, insurance, and promotions.",
        },
        {
          name: "`/profile`",
          value:
            "View your cash, level, XP, Scene Reputation, venues, equipment, income, and next objective.",
        },
        {
          name: "`/roles`",
          value:
            "View earned achievements and progress toward activity, Scene Reputation, and level milestones.",
        },
        {
          name: "`/leaderboard`",
          value:
            "See who is leading the city and compare progress with other players.",
        },
      )
      .setFooter({
        text: "Tip: If you are not sure what to do next, /profile should point you in the right direction.",
      }),

    social: new EmbedBuilder()
      .setColor(0xf472b6)
      .setTitle("🌈 Social Commands")
      .setDescription(
        "Create social items, gift kandi, run ticket contests, and make the city feel more alive.",
      )
      .addFields(
        {
          name: "Kandi",
          value:
            "`/create_kandi` — Create a custom kandi bracelet.\n" +
            "`/give_kandi` — Give one of your kandi pieces to another user.\n" +
            "`/my_kandi` — View your kandi collection.",
        },
        {
          name: "Ticket Contests",
          value:
            "`/start_contest` — Start a ticket contest for one of your shows.\n" +
            "`/enter_contest` — Enter an active ticket contest.\n" +
            "`/draw_winner` — Draw a winner for one of your contests.",
        },
        {
          name: "Why social systems matter",
          value:
            "These commands are not the main money path.\n" +
            "They are there to make shows feel more like community events instead of just numbers going up.",
        },
      )
      .setFooter({
        text: "Tip: Kandi and contests are flavor systems. Use them to make events feel social.",
      }),

    scene: new EmbedBuilder()
      .setColor(0x06b6d4)
      .setTitle("📣 Scene Commands")
      .setDescription(
        "Quick commands for checking what is happening around the city.",
      )
      .addFields(
        {
          name: "`/help`",
          value: "Open this help menu and browse command categories.",
        },
        {
          name: "`/profile`",
          value:
            "Check your current progress, cash, income, Scene Reputation, and next objective.",
        },
        {
          name: "`/my_shows`",
          value: "See your upcoming and completed shows.",
        },
        {
          name: "`/my_venues`",
          value:
            "Check your venues, passive income, upgrades, insurance, staff, and active boosts.",
        },
        {
          name: "`/show_lineup`",
          value: "See the DJs and staff assigned to a show.",
        },
        {
          name: "`/dj_profile`",
          value: "Check another user's DJ profile and scene progress.",
        },
      )
      .setFooter({
        text: "Tip: Use /profile when you need direction. Use /my_shows and /my_venues to check your current city activity.",
      }),
  };

  return embeds[category] || mainHelpEmbed();
}

function helpButtons(active = "home") {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("help_shows")
      .setLabel("Shows")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(active === "shows"),

    new ButtonBuilder()
      .setCustomId("help_games")
      .setLabel("After Hours")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "games"),

    new ButtonBuilder()
      .setCustomId("help_venues")
      .setLabel("Venues")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(active === "venues"),

    new ButtonBuilder()
      .setCustomId("help_djs")
      .setLabel("DJs")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "djs"),

    new ButtonBuilder()
      .setCustomId("help_staff")
      .setLabel("Staff")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "staff"),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("help_economy")
      .setLabel("Money")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "economy"),

    new ButtonBuilder()
      .setCustomId("help_equipment")
      .setLabel("Equipment")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "equipment"),

    new ButtonBuilder()
      .setCustomId("help_progression")
      .setLabel("Progression")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(active === "progression"),

    new ButtonBuilder()
      .setCustomId("help_social")
      .setLabel("Community")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "social"),

    new ButtonBuilder()
      .setCustomId("help_scene")
      .setLabel("City")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "scene"),
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("help_home")
      .setLabel("Back to City Signal")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "home"),
  );

  return [row1, row2, row3];
}

async function help(interaction) {
  return interaction.reply({
    embeds: [mainHelpEmbed()],
    components: helpButtons("home"),
    flags: MessageFlags.Ephemeral,
  });
}

async function handleHelpButton(interaction) {
  const category = interaction.customId.replace("help_", "");

  const embed = category === "home" ? mainHelpEmbed() : categoryEmbed(category);

  return interaction.update({
    embeds: [embed],
    components: helpButtons(category),
  });
}

module.exports = {
  help,
  handleHelpButton,
};
