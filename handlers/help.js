const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

function mainHelpEmbed() {
  return new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎧 WELCOME TO EDMELEVATED CITY")
    .setDescription(
      "Build your name in the scene: work jobs, buy gear, throw shows, promote events, and grow from bedroom DJ to city legend.",
    )
    .addFields(
      {
        name: "🆕 New Player Path",
        value:
          "`/profile` — View your cash, XP, reputation, and next objective\n" +
          "`/work` — Pick a scene job and earn starter cash\n" +
          "`/buy_equipment` — Buy gear that generates passive rental income\n" +
          "`/buy_venue` — Save up and buy your first event space\n" +
          "`/create_show` — Throw your first event\n" +
          "`/promote_show` — Promote your show for more walk-ins\n" +
          "`/collect` — Collect passive venue and equipment income",
      },
      {
        name: "🎵 Core Game Loop",
        value:
          "Work jobs → earn cash + XP → buy equipment → buy venues → create shows → promote shows → collect income → reinvest.",
      },
      {
        name: "💵 Ways To Earn",
        value:
          "`/work` gives reliable cash.\n" +
          "`/crate_dig` and `/rave_story` give quick rewards.\n" +
          "`/street_team` helps promote upcoming shows and build reputation.\n" +
          "`/collect` claims passive income from venues and equipment.\n" +
          "`/collect_show` claims payouts from completed shows.",
      },
      {
        name: "🪩 How Shows Work",
        value:
          "Shows automatically run on their scheduled date.\n" +
          "While waiting, you can promote the show, add DJs, hire staff, work jobs, buy gear, or build reputation.",
      },
      {
        name: "🏆 How Progression Works",
        value:
          "Participating earns **XP**, **cash**, and **reputation**.\n" +
          "XP increases your level. Reputation helps unlock better opportunities.",
      },
      {
        name: "💼 Passive Income",
        value:
          "Own **venues** and **equipment** to generate income over time.\n" +
          "Upgrade venues and hire permanent venue staff to improve earnings.\n\n" +
          "`/my_venues` — View your venues\n" +
          "`/upgrade_venue` — Improve venue departments\n" +
          "`/hire_venue_staff` — Hire permanent venue staff\n" +
          "`/my_equipment` — View your equipment\n" +
          "`/collect` — Collect passive income",
      },
      {
        name: "🧭 Lost?",
        value:
          "Use `/profile` anytime. It should be your home base when you are not sure what to do next.",
      },
    )
    .setFooter({
      text: "Tip: Start with /profile, then use /work to earn your first stack of cash.",
    });
}

function categoryEmbed(category) {
  const embeds = {
    shows: new EmbedBuilder()
      .setColor(0xc084fc)
      .setTitle("🎵 Shows Commands")
      .setDescription("Create, promote, and manage your shows.")
      .addFields(
        {
          name: "/create_show",
          value: "Create a new show at one of your venues.",
        },
        { name: "/my_shows", value: "View your upcoming and active shows." },
        { name: "/promote_show", value: "Promote a show for more walk-ins." },
        { name: "/buy_ticket", value: "Buy a ticket to a show." },
        { name: "/add_lineup", value: "Add a DJ to your show lineup." },
        { name: "/hire_staff", value: "Hire staff for your show." },
        { name: "/show_lineup", value: "View DJs and staff for a show." },
        {
          name: "/collect_show",
          value: "Collect payouts from a completed show.",
        },
      ),

    games: new EmbedBuilder()
      .setColor(0xec4899)
      .setTitle("🎮 Games & Side Activities")
      .setDescription(
        "Quick ways to earn rewards, build reputation, and stay active while waiting for show day.",
      )
      .addFields(
        {
          name: "/crate_dig",
          value: "Dig through crates, discover tracks, and earn quick rewards.",
        },
        {
          name: "/rave_story",
          value:
            "Play a short story event with choices, XP, cash, and reputation.",
        },
        {
          name: "/street_team",
          value:
            "Promote one of your upcoming shows, boost attendance, and build reputation.",
        },
      )
      .setFooter({
        text: "Games should feel like quick rewards. Shows and venues are the bigger long-term money path.",
      }),

    venues: new EmbedBuilder()
      .setColor(0x38bdf8)
      .setTitle("🏟 Venues Commands")
      .setDescription(
        "Buy venues, upgrade departments, hire permanent staff, host shows, and build passive income.",
      )
      .addFields(
        {
          name: "How venues make money",
          value:
            "Venues generate passive income over time.\n" +
            "Income accumulates while you're away until you collect it.\n" +
            "Bigger venues earn more per hour and can host bigger shows.",
        },
        {
          name: "How venue upgrades work",
          value:
            "`/upgrade_venue` lets you improve specific venue departments:\n\n" +
            "🍺 **Bar** — increases passive income\n" +
            "🚪 **Security** — increases venue capacity\n" +
            "🎛 **Production** — boosts show attendance\n" +
            "🧹 **Maintenance** — reduces future incident impact\n\n" +
            "Each upgrade costs more as the department level increases.",
        },
        {
          name: "How venue staff work",
          value:
            "`/hire_venue_staff` hires permanent staff for one of your venues.\n" +
            "Venue staff increase that venue's income over time.\n\n" +
            "🍹 **Bartender** — small income boost\n" +
            "💪 **Bouncer** — stronger income boost\n" +
            "📣 **Promoter** — income boost for venue activity\n" +
            "👔 **Manager** — strongest income boost",
        },
        {
          name: "/buy_venue",
          value: "Purchase a venue and start building passive income.",
        },
        {
          name: "/my_venues",
          value:
            "View your owned venues, capacity, income, staff, upgrades, and uncollected earnings.",
        },
        {
          name: "/upgrade_venue",
          value:
            "Upgrade Bar, Security, Production, or Maintenance for one of your venues.",
        },
        {
          name: "/hire_venue_staff",
          value:
            "Hire permanent staff members for a venue to increase its income.",
        },
        {
          name: "/collect",
          value: "Collect passive income from venues and equipment.",
        },
      )
      .setFooter({
        text: "Tip: Upgrades improve venue stats. Staff improve venue income.",
      }),

    djs: new EmbedBuilder()
      .setColor(0xa78bfa)
      .setTitle("🎧 DJs & Lineup Commands")
      .setDescription("Book DJs and build show lineups.")
      .addFields(
        { name: "/add_lineup", value: "Add a DJ to your show." },
        { name: "/show_lineup", value: "View a show lineup." },
        {
          name: "/dj_profile",
          value: "View a DJ’s reputation and booking fee.",
        },
        { name: "/top_djs", value: "View the top DJs in the city." },
      ),

    staff: new EmbedBuilder()
      .setColor(0xf97316)
      .setTitle("👷 Staff Commands")
      .setDescription("Hire staff and manage jobs.")
      .addFields(
        { name: "/hire_staff", value: "Hire staff for your show." },
        { name: "/my_jobs", value: "View jobs you’ve been hired for." },
      ),

    equipment: new EmbedBuilder()
      .setColor(0x14b8a6)
      .setTitle("🎛 Equipment Commands")
      .setDescription("Buy gear, rent it out, and grow your passive income.")
      .addFields(
        {
          name: "Why equipment matters",
          value:
            "Equipment helps new players start earning passive income.\n" +
            "Multiple copies increase your hourly rental income.\n" +
            "Better gear earns more over time.",
        },
        { name: "/buy_equipment", value: "Purchase gear for rental income." },
        {
          name: "/my_equipment",
          value: "View your owned equipment and uncollected rental income.",
        },
        {
          name: "/collect",
          value: "Collect equipment and venue income.",
        },
      ),

    economy: new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("💵 Economy Commands")
      .setDescription("Earn cash, collect income, and track your progress.")
      .addFields(
        {
          name: "/profile",
          value:
            "View your cash, level, XP, reputation, venues, gear, and next objective.",
        },
        {
          name: "/work",
          value: "Pick a required scene job and earn reliable cash.",
        },
        {
          name: "/collect",
          value: "Collect passive income from venues and equipment.",
        },
        {
          name: "/leaderboard",
          value: "View the top players in the city.",
        },
      ),

    progression: new EmbedBuilder()
      .setColor(0xfacc15)
      .setTitle("🌟 Progression Commands")
      .setDescription("Level up and build your scene reputation.")
      .addFields(
        {
          name: "/profile",
          value: "View your level, XP, and reputation.",
        },
        { name: "/leaderboard", value: "See who is leading the scene." },
        { name: "/roles", value: "View your earned roles." },
      ),

    social: new EmbedBuilder()
      .setColor(0xf472b6)
      .setTitle("🌈 Social Commands")
      .setDescription("Interact with other players.")
      .addFields(
        { name: "/create_kandi", value: "Create a kandi bracelet." },
        { name: "/give_kandi", value: "Give kandi to another user." },
        { name: "/my_kandi", value: "View your kandi collection." },
        { name: "/start_contest", value: "Start a ticket contest." },
        { name: "/enter_contest", value: "Enter an active contest." },
        { name: "/draw_winner", value: "Draw a contest winner." },
      ),

    scene: new EmbedBuilder()
      .setColor(0x06b6d4)
      .setTitle("📣 Scene Commands")
      .setDescription("Stay updated with what’s happening.")
      .addFields(
        { name: "/help", value: "Open this help menu." },
        { name: "/my_shows", value: "See your current shows." },
        { name: "/show_lineup", value: "See show rosters." },
        { name: "/dj_profile", value: "Check a DJ’s status." },
      ),
  };

  return embeds[category] || mainHelpEmbed();
}

function helpButtons(active = "home") {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("help_shows")
      .setLabel("🎵 Shows")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(active === "shows"),

    new ButtonBuilder()
      .setCustomId("help_games")
      .setLabel("🎮 Games")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(active === "games"),

    new ButtonBuilder()
      .setCustomId("help_venues")
      .setLabel("🏟 Venues")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(active === "venues"),

    new ButtonBuilder()
      .setCustomId("help_djs")
      .setLabel("🎧 DJs")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(active === "djs"),

    new ButtonBuilder()
      .setCustomId("help_staff")
      .setLabel("👷 Staff")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "staff"),
  );

  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("help_economy")
      .setLabel("💵 Economy")
      .setStyle(ButtonStyle.Success)
      .setDisabled(active === "economy"),

    new ButtonBuilder()
      .setCustomId("help_equipment")
      .setLabel("🎛 Equipment")
      .setStyle(ButtonStyle.Success)
      .setDisabled(active === "equipment"),

    new ButtonBuilder()
      .setCustomId("help_progression")
      .setLabel("🌟 Progression")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "progression"),

    new ButtonBuilder()
      .setCustomId("help_social")
      .setLabel("🌈 Social")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "social"),

    new ButtonBuilder()
      .setCustomId("help_scene")
      .setLabel("📣 Scene")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "scene"),
  );

  const row3 = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("help_home")
      .setLabel("🏠 Back to Help")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(active === "home"),
  );

  return [row1, row2, row3];
}

async function help(interaction) {
  return interaction.reply({
    embeds: [mainHelpEmbed()],
    components: helpButtons("home"),
    ephemeral: true,
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
