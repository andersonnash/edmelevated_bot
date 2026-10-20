const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require("discord.js");

const CITY_SIGNAL_COLOR = 0x22d3ee;
const CITY_SIGNAL_FOOTER =
  "New to the city? Start with /journey";

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
          "Start unknown. Find gear, build community momentum, and lay the foundation for your first venue.",
      },
      {
        name: "02 // CREATE THE NIGHT",
        value:
          "Secure a room. Book an artist. Move tickets. Staff the floor. Open the doors and live with the result.",
      },
      {
        name: "03 // SHAPE THE CITY",
        value:
          "Own spaces, strengthen scenes, create opportunities, and leave a history other players can feel.",
      },
      {
        name: "START HERE",
        value:
          "**New players begin with `/journey`.**\n" +
          "It teaches the opening path one step at a time. `/profile` becomes your home base for everything that follows.",
      },
      {
        name: "EXPLORE THE CITY",
        value:
          "Use the controls below to tune into shows, venues, crews, equipment, progression, and the wider scene.",
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
            "View upcoming shows and saved ratings for completed shows. Use the buttons to book an artist, promote, hire show staff, or collect payouts.",
        },
        {
          name: "`/promote_show`",
          value:
            "Run a show's one promotional campaign. Its price and demand gain scale with venue size; projected-full shows do not need one.",
        },
        {
          name: "Featured artists",
          value: "Use **Book Artist** in `/my_shows` to choose from the roster available for that venue. The fee is paid upfront and the artist improves projected walk-ins.",
        },
        {
          name: "`/hire_show_staff`",
          value:
            "Hire another user for an automatically assigned show job. Each hire fills a staffing slot, improves the staffing score, and pays $150 when the show is settled.",
        },
        {
          name: "Advance ticket sales",
          value:
            "Upcoming shows can receive automatic advance sales. Confirmed tickets, projected attendance, and revenue appear in `/my_shows`.",
        },
        {
          name: "`/collect_show`",
          value:
            "Collect the owner settlement and pay show staff. Completed show reports rate attendance, profit, production, artist, and staffing.",
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
            "Choose one of several story scenarios, watch it unfold, then make one safe, balanced, or risky decision for the final reward. The run ends after that scenario. Daily diminishing returns keep it playable without replacing jobs or shows.",
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
            "🍺 **Bar Program** — grows from Beer & Wine Service to a Full Bar and Premium Cocktail Program; increases venue income\n" +
            "🚪 **Security** — increases venue capacity\n" +
            "🎛 **Production** — boosts show attendance\n\n" +
            "Each department has three levels. Prices scale with the venue and increase as that department levels up.",
        },
        {
          name: "Venue staff vs show staff",
          value:
            "`/hire_venue_staff` = permanent staff for one venue. They increase that venue's income, and hiring prices scale with venue size.\n" +
            "`/hire_show_staff` = temporary staff for one show. They improve its final staffing score.",
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

    staff: new EmbedBuilder()
      .setColor(0xf97316)
      .setTitle("👷 Staff Commands")
      .setDescription(
        "Show staff help events run better and earn payouts when owners settle shows.",
      )
      .addFields(
        {
          name: "`/hire_show_staff`",
          value:
            "Hire another user for an automatically assigned show job. Each hire fills a staffing slot, improves the final staffing score, and pays $150 after settlement.",
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
            "When the show owner runs `/collect_show`, the completed show is settled and staff payouts are marked paid.",
        },
      ),

    equipment: new EmbedBuilder()
      .setColor(0x14b8a6)
      .setTitle("🎛 Equipment Commands")
      .setDescription(
        "Rent out stored gear or install it at a venue to strengthen its shows.",
      )
      .addFields(
        {
          name: "Why equipment matters",
          value:
            "Equipment is the easiest way for new players to start earning equipment rental income.\n" +
            "Stored copies generate equipment rental income.\n" +
            "Installed gear improves one venue's show attendance and production.",
        },
        {
          name: "Equipment vs venues",
          value:
            "Before you own a venue, gear remains in rentals.\n" +
            "You can own one of each gear type. After buying a venue, use /my_equipment to install, move, or return gear without another command.",
        },
        {
          name: "`/buy_equipment`",
          value: "Purchase gear that generates equipment rental income.",
        },
        {
          name: "`/my_equipment`",
          value:
            "View stored and installed gear, its location and effects, and manage each loadout.",
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
            "Owner collects the settlement from one completed show. This also settles staff payouts for that show.",
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
            "Every new player starts here. Follow one clear objective at a time: buy a controller, build community momentum, and finish with a borrowed-venue showcase that funds your move toward Garage Party.",
        },
        {
          name: "How progression works",
          value:
            "**XP & Level** — unlimited player progression; activities and shows award XP.\n" +
            "**Scene Reputation** — citywide credibility used for venue and progression unlocks.\n" +
            "**Show Rating** — event quality across attendance, profit, production, artist choice, and staffing.\n" +
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
        "Create social items, gift kandi, and make the city feel more alive.",
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
          name: "Why social systems matter",
          value:
            "These commands are not the main money path.\n" +
            "They are there to make shows feel more like community events instead of just numbers going up.",
        },
      )
      .setFooter({
        text: "Tip: Kandi is a flavor system. Use it to make the city feel social.",
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
