const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

function mainHelpEmbed() {
  return new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎧 WELCOME TO EDM ELEVATED CITY")
    .setDescription(
      "Build your reputation, throw shows, book DJs, hire staff, and become a legend in the EDM Elevated scene.",
    )
    .addFields(
      {
        name: "🆕 New Player Path",
        value:
          "`/profile` — View your stats and progression\n" +
          "`/crate_dig` — Discover tracks and earn your first rewards\n" +
          "`/rave_story` — Make choices and gain XP\n" +
          "`/work` — Earn reliable cash\n" +
          "`/buy_venue` — Start your empire\n" +
          "`/create_show` — Throw your first event\n" +
          "`/street_team` — Boost **upcoming** shows and build reputation",
      },
      {
        name: "🎵 Core Game Loop",
        value:
          "Play games → Earn cash + XP → Buy venues & equipment → Generate passive income → Create shows → Collect profits",
      },
      {
        name: "🪩 How Shows Work",
        value:
          "Shows automatically run on their scheduled date.\n" +
          "While waiting, play games, promote events, build lineups, and hire staff.",
      },
      {
        name: "🏆 How Progression Works",
        value:
          "Participating earns **XP**, **cash**, and **reputation**.\n" +
          "Higher reputation unlocks better venues. Higher DJ reputation increases booking fees.",
      },
      {
        name: "💼 Passive Income",
        value:
          "Own **venues** and **equipment** to generate income over time.\n" +
          "`/my_venues` — View your venues\n" +
          "`/my_equipment` — View your equipment\n" +
          "`/collect` — Collect all passive income",
      },
      {
        name: "🎮 Games",
        value:
          "Visit the Games tab below to see interactive ways to earn money, XP, and reputation.",
      },
    )
    .setFooter({
      text: "💡 Shows run automatically on their scheduled date. Play games while you wait.",
    });
}

function categoryEmbed(category) {
  const embeds = {
    shows: new EmbedBuilder()
      .setColor(0xc084fc)
      .setTitle("🎵 Shows Commands")
      .setDescription("Create, promote, and manage your shows.")
      .addFields(
        { name: "/create_show", value: "Create a new show." },
        { name: "/my_shows", value: "View your upcoming shows." },
        { name: "/promote_show", value: "Promote a show for more walk-ins." },
        { name: "/buy_ticket", value: "Buy a ticket to a show." },
        { name: "/show_lineup", value: "View DJs and staff for a show." },
        { name: "/collect", value: "Collect completed show profits." },
        {
          name: "/force_run_show",
          value: "Dev/test command to run a show immediately.",
        },
      ),

    games: new EmbedBuilder()
      .setColor(0xec4899)
      .setTitle("🎮 Games Commands")
      .setDescription(
        "Earn rewards, reputation, and progress while waiting for show day.",
      )
      .addFields(
        {
          name: "/crate_dig",
          value: "Dig through crates and discover tracks for rewards.",
        },

        {
          name: "/rave_story",
          value: "Interactive EDM adventures with choices and consequences.",
        },

        {
          name: "/street_team",
          value: "Promote one of your upcoming shows and boost attendance.",
        },
      )
      .setFooter({
        text: "Games help fund your journey into show ownership.",
      }),

    venues: new EmbedBuilder()
      .setColor(0x38bdf8)
      .setTitle("🏟 Venues Commands")
      .setDescription("Buy venues, host shows, and build passive income.")
      .addFields(
        {
          name: "How venues make money",
          value:
            "Venues generate passive income over time.\n" +
            "Income accumulates while you're away until you collect it.\n" +
            "Bigger venues earn more per hour and can host bigger shows.",
        },
        { name: "/buy_venue", value: "Purchase a venue." },
        {
          name: "/my_venues",
          value: "View venue income, uncollected earnings, and capacity.",
        },
        {
          name: "/upgrade_venue",
          value: "Upgrade lights, sound, DJ gear, or stage.",
        },
        { name: "/collect", value: "Collect venue income and other earnings." },
      ),

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
          name: "How equipment makes money",
          value:
            "Equipment earns rental income over time.\n" +
            "Multiple copies increase your hourly rental income.\n" +
            "Higher-end gear earns more per hour.",
        },
        { name: "/buy_equipment", value: "Purchase gear for rental income." },
        {
          name: "/my_equipment",
          value: "View your owned equipment and uncollected rental income.",
        },
        {
          name: "/collect",
          value: "Collect equipment income and other earnings.",
        },
      ),

    economy: new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("💵 Economy Commands")
      .setDescription("Earn money and manage your wallet.")
      .addFields(
        { name: "/profile", value: "View your player profile." },
        { name: "/work", value: "Earn cash and XP." },
        { name: "/collect", value: "Collect show earnings." },
        { name: "/leaderboard", value: "View top players." },
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
