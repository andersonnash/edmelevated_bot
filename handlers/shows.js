const db = require("../db");

const { getUser, addRole } = require("../services/roles");

const { addXp, announceLevelUp } = require("../services/xp");

const { postSceneFeed } = require("../services/sceneFeed");

const { runShowById } = require("../services/showRunner");

const { settleShowPayouts, getOwnedShow } = require("../services/showPayouts");

const { addCash } = require("../services/economy");
const { money } = require("../services/formatters");
const { showStaffRole } = require("../services/showStaffRules");
const { ownedVenueLabel } = require("../services/venueDisplayRules");
const { automatedTicketSummary } = require("../services/ticketSales");
const { promotionCampaign } = require("../services/promotionRules");
const { purchasePromotion } = require("../services/promotionPurchase");

const {
  getVenueIncome,
  getEquipmentIncome,
  venueCapacity,
  getInstalledEquipmentEffects,
} = require("../services/venueEngine");

const {
  calculateProjectedWalkins,
  attendanceBonusPercent,
  generateInitialWalkins,
  ticketPriceDemandLabel,
  applyTicketPriceDemand,
  isProjectedSoldOut,
} = require("../services/showForecast");

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

const {
  randomShowData,
  todayString,
} = require("../services/generators");

const { SHOW_GENRES, SHOW_CREATION_XP, isOwner } = require("../constants");
const { artistsForVenue, artistForVenue } = require("../services/npcArtists");

const { isBotAdmin } = require("../constants");

async function createShow(interaction) {
  const userId = interaction.user.id;

  const venueId = interaction.options.getString("venue");
  const genre = interaction.options.getString("genre");
  const ticketPrice = interaction.options.getInteger("ticket_price");
  const customName = interaction.options.getString("name")?.trim();

  const venue = db
    .prepare(
      `
        SELECT *
        FROM venues
        WHERE id = ?
        AND owner_id = ?
      `,
    )
    .get(venueId, userId);

  if (!venue) {
    return interaction.editReply({
      content: "You can only create shows at venues you own.",
      ephemeral: true,
    });
  }

  const venueLabel = ownedVenueLabel(
    db
      .prepare("SELECT id, name, type FROM venues WHERE owner_id = ?")
      .all(userId),
    venue.id,
  );

  const bookedDates = db
    .prepare(
      `SELECT show_date FROM shows
       WHERE venue_id = ? AND status = 'upcoming'`,
    )
    .all(venue.id)
    .map((show) => show.show_date);
  const event = randomShowData({ unavailableDates: bookedDates });
  if (!event) {
    return interaction.editReply({
      content:
        `**${venueLabel}** is fully booked for the next two weeks. ` +
        "Complete a show or choose another venue before creating another event.",
      ephemeral: true,
    });
  }
  const showName = customName || event.name;

  const equipmentEffects = getInstalledEquipmentEffects(venue.id);
  const venueWithEquipment = {
    ...venue,
    installed_equipment_attendance_bonus: equipmentEffects.attendanceBonus,
  };
  const initialWalkins = generateInitialWalkins(venueWithEquipment);
  const baseWalkins = applyTicketPriceDemand(initialWalkins, ticketPrice);

  const projectedWalkins = calculateProjectedWalkins({
    baseWalkins,
    venue: venueWithEquipment,
  });
  const capacity = venueCapacity(venueWithEquipment);
  const campaign = promotionCampaign(venue);

  const created = db
    .prepare(
      `
    INSERT INTO shows (
      owner_id,
      venue_id,
      name,
      genre,
      show_date,
      ticket_price,
      simulated_attendees,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, 'upcoming')
  `,
    )
    .run(
      userId,
      venue.id,
      showName,
      genre,
      event.date,
      ticketPrice,
      baseWalkins,
    );

  const showId = created.lastInsertRowid;
  const xpUpdate = addXp(userId, SHOW_CREATION_XP);
  await announceLevelUp(interaction, xpUpdate);

  addRole(userId, "Promoter");

  const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
  } = require("discord.js");

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎧 SHOW CREATED")
    .setDescription(`**${showName}**`)
    .addFields(
      {
        name: "📍 Venue",
        value: venueLabel,
        inline: true,
      },
      {
        name: "🎵 Genre",
        value: SHOW_GENRES[genre],
        inline: true,
      },
      {
        name: "📅 Scheduled Date",
        value: event.date,
        inline: true,
      },
      {
        name: "🎟️ Ticket Price",
        value: `$${ticketPrice}`,
        inline: true,
      },
      {
        name: "👥 Forecast",
        value:
          `Ticket Holders: **0**\n` +
          `Projected Walk-ins: **${projectedWalkins}**\n` +
          `Projected Attendance: **${projectedWalkins} / ${capacity}**\n` +
          `Price Effect: **${ticketPriceDemandLabel(ticketPrice)}**\n` +
          `Venue Boost: **+${attendanceBonusPercent(venueWithEquipment)}%**\n` +
          `Installed Gear: **+${Math.round(equipmentEffects.attendanceBonus * 100)}% attendance, +${equipmentEffects.productionBonus} production**`,
      },
      {
        name: "🎧 Featured Artist",
        value:
          "Not booked yet. Choose a venue-tiered artist to increase the projected walk-ins for this show.",
      },
      {
        name: "🚀 Next Steps",
        value:
          "Book a featured artist, hire show staff, and promote the show before show day.",
      },
      {
        name: "📣 Promotion Campaign",
        value:
          `One campaign available • **${money(campaign.cost)}**\n` +
          `Adds **+${campaign.demand} base demand** and cannot be repeated.`,
      },
    )
    .setFooter({
      text: "Use the buttons below to keep building",
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`promote_show_${showId}`)
      .setLabel(`📣 Promote • ${money(campaign.cost)}`)
      .setStyle(ButtonStyle.Primary),

    new ButtonBuilder()
      .setCustomId(`book_artist_${showId}`)
      .setLabel("🎧 Book Artist")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId(`hire_show_${showId}`)
      .setLabel("👷 Hire Show Staff")
      .setStyle(ButtonStyle.Success),
  );

  await postSceneFeed(
    interaction.client,
    process.env.SCENE_FEED_CHANNEL_ID,
    { embeds: [embed] },
    {
      color: 0x8b5cf6,
      title: "🎧 New Show Created",
      description: `**${interaction.user.username}** created **${showName}**`,
      fields: [
        {
          name: "Venue",
          value: venueLabel,
          inline: true,
        },
        {
          name: "Genre",
          value: SHOW_GENRES[genre],
          inline: true,
        },
        {
          name: "Date",
          value: event.date,
          inline: true,
        },
        {
          name: "Tickets",
          value: `$${ticketPrice}`,
          inline: true,
        },
      ],
      footer: "EDMELEVATED Scene Feed",
    },
  );

  return interaction.reply({
    embeds: [embed],
    components: [row],
  });
}

function getOwnedUpcomingShowWithArtist(showId, userId) {
  return db
    .prepare(
      `
      SELECT
        shows.*,
        venues.name AS venue_name,
        venues.type AS venue_type,
        show_artists.artist_name,
        show_artists.artist_tier,
        show_artists.booking_fee,
        show_artists.demand_bonus
      FROM shows
      JOIN venues ON venues.id = shows.venue_id
      LEFT JOIN show_artists ON show_artists.show_id = shows.id
      WHERE shows.id = ?
        AND shows.owner_id = ?
        AND shows.status = 'upcoming'
      `,
    )
    .get(showId, userId);
}

async function handleBookArtistButton(interaction) {
  const showId = Number(interaction.customId.replace("book_artist_", ""));
  const show = getOwnedUpcomingShowWithArtist(showId, interaction.user.id);

  if (!show) {
    return interaction.reply({
      content: "You can only book an artist for one of your upcoming shows.",
      ephemeral: true,
    });
  }

  if (show.artist_name) {
    return interaction.reply({
      content: `**${show.artist_name}** is already booked for **${show.name}**.`,
      ephemeral: true,
    });
  }

  const artists = artistsForVenue(show.venue_type);
  if (!artists.length) {
    return interaction.reply({
      content: "This venue does not have a featured-artist roster yet.",
      ephemeral: true,
    });
  }

  const picker = new StringSelectMenuBuilder()
    .setCustomId(`artist_select:${show.id}`)
    .setPlaceholder("Choose a featured artist")
    .addOptions(
      artists.map((artist) => ({
        label: artist.name,
        value: artist.key,
        description: `${money(artist.fee)} upfront • +${artist.demand} projected walk-ins`,
      })),
    );

  const embed = new EmbedBuilder()
    .setColor(0x8b5cf6)
    .setTitle("🎧 BOOK FEATURED ARTIST")
    .setDescription(`**${show.name}** • ${show.venue_name}`)
    .addFields({
      name: "Your venue-tier roster",
      value: "Choose one artist. The booking fee is paid now and the artist raises this show's projected walk-ins.",
    })
    .setFooter({
      text: "Simulated in-game bookings only; no real-world artist affiliation or appearance.",
    });

  return interaction.reply({
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(picker)],
    ephemeral: true,
  });
}

async function handleArtistSelect(interaction) {
  const [, showId] = interaction.customId.split(":");
  const show = getOwnedUpcomingShowWithArtist(showId, interaction.user.id);
  const artist = show
    ? artistForVenue(show.venue_type, interaction.values[0])
    : null;

  if (!show || !artist) {
    return interaction.update({
      content: "That artist selection is no longer available for this show.",
      embeds: [],
      components: [],
    });
  }

  if (show.artist_name) {
    return interaction.update({
      content: `**${show.artist_name}** is already booked for this show.`,
      embeds: [],
      components: [],
    });
  }

  try {
    const remainingCash = db.transaction(() => {
      const charged = db
        .prepare(
          "UPDATE users SET cash = cash - ? WHERE discord_id = ? AND cash >= ?",
        )
        .run(artist.fee, interaction.user.id, artist.fee);
      if (charged.changes !== 1) throw new Error("INSUFFICIENT_CASH");

      const booked = db
        .prepare(
          `INSERT INTO show_artists (
            show_id, artist_key, artist_name, artist_tier, booking_fee, demand_bonus
          ) VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .run(
          show.id,
          artist.key,
          artist.name,
          artist.tier,
          artist.fee,
          artist.demand,
        );
      if (booked.changes !== 1) throw new Error("ARTIST_ALREADY_BOOKED");

      return db
        .prepare("SELECT cash FROM users WHERE discord_id = ?")
        .get(interaction.user.id).cash;
    })();

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("🎧 FEATURED ARTIST BOOKED")
      .setDescription(`**${artist.name}** is booked for **${show.name}**.`)
      .addFields(
        {
          name: "Artist draw",
          value: `+${artist.demand} projected walk-ins`,
          inline: true,
        },
        {
          name: "Booking fee paid",
          value: money(artist.fee),
          inline: true,
        },
        {
          name: "Remaining cash",
          value: money(remainingCash),
          inline: true,
        },
      )
      .setFooter({
        text: "The fee was paid upfront and is included in this event's final profit.",
      });

    return interaction.update({ embeds: [embed], components: [] });
  } catch (error) {
    if (error.message === "INSUFFICIENT_CASH") {
      return interaction.update({
        content: `You need **${money(artist.fee)}** to book **${artist.name}**. No cash was spent.`,
        embeds: [],
        components: [],
      });
    }
    if (error.message === "ARTIST_ALREADY_BOOKED") {
      return interaction.update({
        content: "An artist was already booked for this show. No cash was spent.",
        embeds: [],
        components: [],
      });
    }
    throw error;
  }
}

function getUserShows(userId) {
  const shows = db
    .prepare(
      `
     SELECT
        shows.*,
        venues.name AS venue_name,
        venues.type,
        venues.base_capacity,
        venues.staff_limit,
        venues.bar_level,
        venues.security_level,
        venues.production_level,
        show_artists.artist_name,
        show_artists.artist_tier,
        show_artists.booking_fee,
        show_artists.demand_bonus,
        show_ratings.attendance_score AS rating_attendance,
        show_ratings.profitability_score AS rating_profitability,
        show_ratings.production_score AS rating_production,
        show_ratings.artist_score AS rating_artist,
        show_ratings.staffing_score AS rating_staffing,
        show_ratings.overall_score AS rating_overall,
        show_ratings.star_rating AS rating_stars,
        show_ratings.crowd_reaction AS rating_reaction
      FROM shows
      LEFT JOIN venues ON venues.id = shows.venue_id
      LEFT JOIN show_ratings ON show_ratings.show_id = shows.id
      LEFT JOIN show_artists ON show_artists.show_id = shows.id
      WHERE shows.owner_id = ?
      ORDER BY shows.show_date ASC
    `,
    )
    .all(userId);
  return shows.map((show) => {
    const effects = getInstalledEquipmentEffects(show.venue_id);
    return {
      ...show,
      installed_equipment_attendance_bonus: effects.attendanceBonus,
      installed_equipment_production_bonus: effects.productionBonus,
    };
  });
}

function getShowCounts(showId) {
  const staff = db
    .prepare("SELECT COUNT(*) AS count FROM show_staff WHERE show_id = ?")
    .get(showId);

  const tickets = db
    .prepare("SELECT COUNT(*) AS count FROM show_tickets WHERE show_id = ?")
    .get(showId);
  const advanceSales = automatedTicketSummary(showId);
  const unpaidPayouts = db
    .prepare(
      "SELECT COUNT(*) AS count FROM show_payouts WHERE show_id = ? AND paid = 0",
    )
    .get(showId);

  return {
    showStaffCount: staff.count || 0,
    ticketCount:
      (tickets.count || 0) + Number(advanceSales.quantity || 0),
    advanceTicketCount: Number(advanceSales.quantity || 0),
    advanceTicketRevenue: Number(advanceSales.revenue || 0),
    unpaidPayoutCount: unpaidPayouts.count || 0,
  };
}

function buildMyShowsSummary(userId) {
  const shows = getUserShows(userId);

  const upcoming = shows.filter((s) => s.status === "upcoming");
  const completed = shows.filter((s) => s.status === "completed");

  const embed = new EmbedBuilder()
    .setColor(0xc084fc)
    .setTitle("🎟 YOUR SHOWS")
    .setDescription("Manage your upcoming and completed events.")
    .addFields(
      {
        name: "🟢 Upcoming",
        value: `${upcoming.length}`,
        inline: true,
      },
      {
        name: "✅ Completed",
        value: `${completed.length}`,
        inline: true,
      },
      {
        name: "📊 Total Shows",
        value: `${shows.length}`,
        inline: true,
      },
    )
    .setFooter({
      text: "Choose a category below.",
    });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("shows_upcoming_0")
      .setLabel("🟢 Upcoming")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(upcoming.length === 0),

    new ButtonBuilder()
      .setCustomId("shows_completed_0")
      .setLabel("✅ Completed")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(completed.length === 0),
  );

  return { embed, row };
}

function buildShowPage(userId, status, page = 0) {
  const shows = getUserShows(userId).filter((s) => s.status === status);

  if (!shows.length) {
    return buildMyShowsSummary(userId);
  }

  const totalPages = shows.length;
  const safePage = Math.max(0, Math.min(page, totalPages - 1));
  const show = shows[safePage];

  const {
    showStaffCount,
    ticketCount,
    advanceTicketCount,
    advanceTicketRevenue,
    unpaidPayoutCount,
  } = getShowCounts(show.id);
  const finalCapacity = venueCapacity(show);

  const baseProjectedWalkins = Number(show.simulated_attendees || 0);
  const projectedWalkins = calculateProjectedWalkins({
    baseWalkins: baseProjectedWalkins,
    venue: show,
    ticketCount,
    artistDemand: Number(show.demand_bonus || 0),
  });
  const attendanceBoostPercent = attendanceBonusPercent(show);
  const projectedAttendance = ticketCount + projectedWalkins;
  const campaign = promotionCampaign(show);
  const promotionUsed = Number(show.promotion_used || 0) === 1;
  const projectedFull = projectedAttendance >= finalCapacity;
  const closureEndsAt = show.closed_until
    ? new Date(show.closed_until.replace(" ", "T") + "Z")
    : null;
  const isDelayedByClosure =
    status === "upcoming" &&
    show.show_date <= todayString() &&
    closureEndsAt &&
    closureEndsAt > new Date();

  const title =
    status === "upcoming"
      ? `🟢 UPCOMING SHOW (${safePage + 1}/${totalPages})`
      : `✅ COMPLETED SHOW (${safePage + 1}/${totalPages})`;

  const embed = new EmbedBuilder()
    .setColor(status === "upcoming" ? 0x22c55e : 0xfacc15)
    .setTitle(title)
    .setDescription(`**${show.name}**`)
    .addFields(
      {
        name: "🏟 Venue",
        value: show.venue_name || "Unknown venue",
        inline: true,
      },
      {
        name: "🎵 Genre",
        value: SHOW_GENRES[show.genre] || "Mixed",
        inline: true,
      },
      {
        name: "📅 Scheduled Date",
        value: show.show_date || "No date set",
        inline: true,
      },
      {
        name: "🎟 Ticket Price",
        value:
          `${money(show.ticket_price || 0)}\n` +
          `${ticketPriceDemandLabel(show.ticket_price || 0)}`,
        inline: true,
      },
      {
        name: "🎫 Ticket Holders",
        value:
          `${ticketCount} confirmed\n` +
          `${advanceTicketCount} from advance sales`,
        inline: true,
      },
      {
        name: "🎧 Featured Artist",
        value: show.artist_name
          ? `**${show.artist_name}**\n${show.artist_tier} • +${show.demand_bonus} projected walk-ins\nFee paid: ${money(show.booking_fee)}`
          : "Not booked — choose an artist to raise projected walk-ins.",
        inline: true,
      },
      {
        name: "👷 Show Staff",
        value:
          `${showStaffCount}/${show.staff_limit || 0} hired\n` +
          "Improves the final staffing score",
        inline: true,
      },
    )
    .setFooter({
      text:
        status === "upcoming"
          ? "Book an artist, hire show staff, and promote before show day."
          : "Use /collect_show to settle this completed show.",
    });

  if (status === "upcoming") {
    embed.addFields(
      {
        name: "🎟 Advance Sales",
        value:
          advanceTicketCount > 0
            ? `${advanceTicketCount} tickets • ${money(advanceTicketRevenue)} confirmed revenue`
            : "No automated advance sales yet.",
      },
      {
        name: "👥 Projected Walk-ins",
        value: `${projectedWalkins}`,
        inline: true,
      },
      {
        name: "🏟 Projected Attendance",
        value: `${projectedAttendance} / ${finalCapacity}`,
        inline: true,
      },
      {
        name: "📈 Attendance Boost",
        value:
          `+${attendanceBoostPercent}% total\n` +
          `Installed gear: +${Math.round(Number(show.installed_equipment_attendance_bonus || 0) * 100)}% attendance • +${Number(show.installed_equipment_production_bonus || 0)} production`,
        inline: true,
      },
      {
        name: promotionUsed
          ? "✅ Promotion Complete"
          : projectedFull
            ? "✅ Campaign Unnecessary"
            : "📣 Promotion Available",
        value: promotionUsed
          ? `This show's one campaign has been used.`
          : projectedFull
            ? "The show is already projected to reach capacity through organic demand."
            : `${money(campaign.cost)} • +${campaign.demand} base demand • one use`,
      },
    );
  } else {
    embed.addFields({
      name: "💰 Settlement Status",
      value: unpaidPayoutCount > 0 ? "Ready to Settle" : "Settled",
      inline: true,
    });
  }

  if (isDelayedByClosure) {
    const reopensAt = Math.floor(closureEndsAt.getTime() / 1000);
    embed.addFields({
      name: "⚠️ Show Delayed",
      value:
        `${show.closure_reason || "The venue is temporarily closed."}\n` +
        `Venue reopens <t:${reopensAt}:F> (<t:${reopensAt}:R>). The show will run on the first hourly scheduler cycle after reopening.`,
    });
  }

  if (status === "completed" && show.rating_overall != null) {
    embed.addFields({
      name: "⭐ Saved Show Rating",
      value:
        `**Overall:** ${show.rating_stars}/5 ★ (${show.rating_overall}/100)\n` +
        `Attendance ${show.rating_attendance} • Profit ${show.rating_profitability} • ` +
        `Production ${show.rating_production}\n` +
        `Artist ${show.rating_artist} • Staffing ${show.rating_staffing}\n` +
        `*“${show.rating_reaction}”*`,
    });
  }

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`shows_${status}_${safePage - 1}`)
      .setLabel("⬅ Previous")
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(safePage === 0),

    new ButtonBuilder()
      .setCustomId("shows_home")
      .setLabel("🏠 Summary")
      .setStyle(ButtonStyle.Secondary),

    new ButtonBuilder()
      .setCustomId(`shows_${status}_${safePage + 1}`)
      .setLabel("Next ➡")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(safePage === totalPages - 1),
  );

  if (status === "upcoming") {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`promote_show_${show.id}`)
        .setLabel(
          promotionUsed
            ? "✅ Promoted"
            : projectedFull
              ? "✅ Projected Full"
              : `📣 Promote • ${money(campaign.cost)}`,
        )
        .setStyle(promotionUsed || projectedFull ? ButtonStyle.Secondary : ButtonStyle.Success)
        .setDisabled(promotionUsed || projectedFull),
      new ButtonBuilder()
        .setCustomId(`book_artist_${show.id}`)
        .setLabel(show.artist_name ? `🎧 ${show.artist_name}` : "🎧 Book Artist")
        .setStyle(show.artist_name ? ButtonStyle.Secondary : ButtonStyle.Primary)
        .setDisabled(Boolean(show.artist_name)),
    );
  }

  return { embed, row };
}

async function myShows(interaction) {
  const userId = interaction.user.id;

  const { embed, row } = buildMyShowsSummary(userId);

  return interaction.reply({
    embeds: [embed],
    components: [row],
  });
}

async function handleShowPage(interaction) {
  const userId = interaction.user.id;

  if (interaction.customId === "shows_home") {
    const { embed, row } = buildMyShowsSummary(userId);

    return interaction.update({
      embeds: [embed],
      components: [row],
    });
  }

  const parts = interaction.customId.split("_");
  const status = parts[1];
  const page = Number(parts[2]);

  const { embed, row } = buildShowPage(userId, status, page);

  return interaction.update({
    embeds: [embed],
    components: [row],
  });
}

function buildRunShowEmbed(result) {
  const {
    show,
    confirmedTicketCount,
    staff,
    artist,
    adjustedWalkins,
    paidRevenue,
    simulatedRevenue,
    totalAttendance,
    staffCost,
    artistFee,
    operatingCost,
    bonusRevenue,
    settlementPayout,
    eventProfit,
    rating,
    baseReputationGain,
    reputationGain,
    xpUpdate,
  } = result;

  const staffSummary = staff.length
    ? staff
        .map((person) => {
          const assignment = showStaffRole(person.role);
          return (
            `${assignment.emoji} ${person.hired_username} — ` +
            `${assignment.label} — ${money(person.pay)}`
          );
        })
        .join("\n")
    : "None";

  return new EmbedBuilder()
    .setColor(eventProfit >= 0 ? 0x00ff88 : 0xff3355)
    .setTitle("🎧 EDMELEVATED SHOW REPORT")
    .setDescription(`**${show.name}**`)
    .addFields(
      {
        name: "📍 Event",
        value:
          `**Venue:** ${show.venue_name}\n` +
          `**Genre:** ${SHOW_GENRES[show.genre] || "Mixed"}`,
      },
      {
        name: "👥 Attendance",
        value:
          `**Ticket Holders:** ${confirmedTicketCount}\n` +
          `**Walk-ins:** ${adjustedWalkins}\n` +
          `**Total:** ${totalAttendance}`,
      },
      {
        name: "💸 Money",
        value:
          `**Ticket Revenue:** ${money(paidRevenue)}\n` +
          `**Walk-in Revenue:** ${money(simulatedRevenue)}\n` +
          `**Upgrade Bonus:** ${money(bonusRevenue)}\n` +
          `**Staff Cost:** -${money(staffCost)}\n` +
          `**Operating Cost:** -${money(operatingCost)}\n` +
          `**Settlement Payout:** ${money(settlementPayout)}\n` +
          `**Artist Fee (paid upfront):** -${money(artistFee)}\n` +
          `**Event Profit:** ${money(eventProfit)}`,
      },
      {
        name: "⭐ Show Rating",
        value:
          `**Overall:** ${rating.stars}/5 ★ (${rating.overallScore}/100)\n` +
          `**Attendance:** ${rating.attendance}/100\n` +
          `**Profitability:** ${rating.profitability}/100\n` +
          `**Production:** ${rating.production}/100\n` +
          `**Artist:** ${rating.artist}/100\n` +
          `**Staffing:** ${rating.staffing}/100\n\n` +
          `*“${rating.reaction}”*`,
      },
      {
        name: "👷 Staff Payouts",
        value: staff.length
          ? `${staffSummary}\n*Pending settlement*`
          : staffSummary,
      },
      {
        name: "🎧 Featured Artist",
        value: artist
          ? `${artist.artist_name} • ${artist.artist_tier}\nFee paid upfront: ${money(artist.booking_fee)}`
          : "No featured artist was booked for this show.",
      },
      {
        name: "⭐ Rewards",
        value:
          `**XP:** +${xpUpdate.xpGain}${xpUpdate.leveledUp ? ` • Level ${xpUpdate.newLevel}!` : ""}\n` +
          `**Base Scene Reputation:** +${baseReputationGain}\n` +
          `**Rating Bonus:** +${rating.reputationBonus}\n` +
          `**Total Scene Reputation:** +${reputationGain}`,
      },
    )
    .setFooter({
      text: "Use /collect_show to claim the settlement and distribute staff payouts",
    });
}

function buildCollectShowRow(showId) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId(`collect_show_${showId}`)
      .setLabel("Settle Show")
      .setStyle(ButtonStyle.Success),
  );
}

async function runShow(interaction) {
  const userId = interaction.user.id;

  if (!isBotAdmin(userId)) {
    return interaction.reply({
      content: "Bot admin only.",
      ephemeral: true,
    });
  }

  const showId = interaction.options?.getString("show");

  const bypassDate = interaction.commandName === "force_run_show";

  const showCheck = db
    .prepare(
      `
      SELECT *
      FROM shows
      WHERE id = ?
        AND owner_id = ?
        AND status = 'upcoming'
      `,
    )
    .get(showId, userId);

  if (!showCheck) {
    return interaction.reply({
      content: "You can only run your own upcoming shows.",
      ephemeral: true,
    });
  }

  if (!bypassDate && showCheck.show_date > todayString()) {
    return interaction.editReply({
      content: `This show is scheduled for ${showCheck.show_date}.`,
      ephemeral: true,
    });
  }

  const result = await runShowById(showId);

  if (!result) {
    return interaction.reply({
      content: "Show could not be run.",
      ephemeral: true,
    });
  }

  await announceLevelUp(interaction, result.xpUpdate);

  const embed = buildRunShowEmbed(result);
  const row = buildCollectShowRow(result.show.show_id);

  const response = {
    embeds: [embed],
    components: [row],
  };
  if (interaction.deferred || interaction.replied) {
    return interaction.editReply(response);
  }

  return interaction.reply(response);
}

async function collect(interaction) {
  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply({ ephemeral: true });
  }

  const userId = interaction.user.id;

  try {
    const venueData = getVenueIncome(userId);
    const equipmentData = getEquipmentIncome(userId);
    const passiveTotal = (venueData.total || 0) + (equipmentData.total || 0);

    if (passiveTotal <= 0) {
      return interaction.editReply({
        content: "Nothing to collect yet.",
      });
    }

    const transaction = db.transaction(() => {
      addCash(userId, passiveTotal);

      db.prepare(
        `UPDATE venues SET last_collected_at = datetime('now') WHERE owner_id = ?`,
      ).run(userId);

      db.prepare(
        `UPDATE user_equipment
         SET last_collected_at = datetime('now'), accrued_income = 0
         WHERE user_id = ?`,
      ).run(userId);
    });

    transaction();

    return interaction.editReply(`💸 Collected **${money(passiveTotal)}**`);
  } catch (error) {
    console.error("Collection error:", error);
    return interaction.editReply("An error occurred while collecting.");
  }
}

async function collectShow(interaction, buttonShowId = null) {
  if (!interaction.deferred && !interaction.replied) {
    await interaction.deferReply({ ephemeral: true });
  }

  const userId = interaction.user.id;
  const showId = buttonShowId || Number(interaction.options.getString("show"));

  try {
    const show = getOwnedShow(showId, userId);

    if (!show) {
      return interaction.editReply(
        "I couldn't find a show with that ID that belongs to you.",
      );
    }

    if (show.status !== "completed") {
      return interaction.editReply(
        "That show is not completed yet. You can only settle completed shows.",
      );
    }

    const settlement = settleShowPayouts(showId);

    if (!settlement) {
      return interaction.editReply(
        "There are no unpaid payouts for this show. It may have already been settled.",
      );
    }

    const { staff, ownerTake, totalPaid } = settlement;
    if (ownerTake > 0) {
      addRole(userId, "Profitable Promoter");
    }
    const participantPayouts = staff.reduce(
      (sum, payout) => sum + payout.amount,
      0,
    );

    const balance =
      db.prepare("SELECT cash FROM users WHERE discord_id = ?").get(userId)
        ?.cash ?? 0;

    const formatPayoutLine = (settlement) => {
      const mention = `<@${settlement.user_id}>`;
      return `• ${mention}: ${money(settlement.amount)}`;
    };

    const staffLines = staff.length
      ? staff.map(formatPayoutLine).join("\n")
      : "• None";

    const embed = new EmbedBuilder()
      .setColor(0x22c55e)
      .setTitle("💰 SHOW SETTLED")
      .setDescription(`**${show.name}**\nAll show payouts have been processed.`)
      .addFields(
        {
          name: "🏟️ Owner Result",
          value: `${interaction.user}\n${money(ownerTake)}`,
          inline: false,
        },
        {
          name: "👥 Staff",
          value: staffLines,
          inline: true,
        },
        {
          name: "📊 Settlement",
          value:
            `**Participant Payouts:** ${money(participantPayouts)}\n` +
            `**Net Settlement:** ${money(totalPaid)}\n` +
            `**Balance:** ${money(balance)}`,
          inline: false,
        },
      )
      .setFooter({
        text: `${show.name} has been settled.`,
      });
    return interaction.editReply({ embeds: [embed] });
  } catch (error) {
    console.error("collectShow error:", error);
    return interaction.editReply(
      "An error occurred while settling this show.",
    );
  }
}

async function promoteShowById(interaction, showId) {
  const userId = interaction.user.id;
  const username = interaction.user.username;

  const show = db
    .prepare(
      `
      SELECT *
      FROM shows
      WHERE id = ?
        AND owner_id = ?
        AND status = 'upcoming'
      `,
    )
    .get(showId, userId);

  if (!show) {
    return interaction.reply({
      content: "You can only promote your own upcoming shows.",
      ephemeral: true,
    });
  }

  if (Number(show.promotion_used || 0) === 1) {
    return interaction.reply({
      content: `**${show.name}** has already used its one promotion campaign. No cash was spent.`,
      ephemeral: true,
    });
  }

  const venue = db.prepare("SELECT * FROM venues WHERE id = ?").get(show.venue_id);
  if (!venue) {
    return interaction.reply({
      content: "This show's venue could not be found.",
      ephemeral: true,
    });
  }
  const artist = db
    .prepare("SELECT demand_bonus FROM show_artists WHERE show_id = ?")
    .get(show.id);
  const campaign = promotionCampaign(venue);
  const equipmentEffects = getInstalledEquipmentEffects(venue.id);
  venue.installed_equipment_attendance_bonus = equipmentEffects.attendanceBonus;
  const ticketCount = db
    .prepare("SELECT COUNT(*) AS count FROM show_tickets WHERE show_id = ?")
    .get(show.id).count;
  const advanceSales = automatedTicketSummary(show.id);
  const confirmedTicketCount =
    ticketCount + Number(advanceSales.quantity || 0);
  const baseWalkins = Number(show.simulated_attendees || 0);
  const projectedBeforePromotion = calculateProjectedWalkins({
    baseWalkins,
    venue,
    ticketCount: confirmedTicketCount,
    artistDemand: Number(artist?.demand_bonus || 0),
  });

  if (
    isProjectedSoldOut({
      baseWalkins,
      venue,
      ticketCount: confirmedTicketCount,
      artistDemand: Number(artist?.demand_bonus || 0),
    })
  ) {
    return interaction.reply({
      content:
        `🎟️ **${show.name}** is already projected to sell out.\n` +
        `Capacity: **${venueCapacity(venue)}** • Tickets: **${confirmedTicketCount}** • ` +
        `Projected walk-ins: **${projectedBeforePromotion}**\n` +
        "No promotion was purchased and no cash was spent.",
      ephemeral: true,
    });
  }

  const user = getUser(userId);

  if (!user) {
    return interaction.reply({
      content: "Run `/profile` first so I can create your city profile.",
      ephemeral: true,
    });
  }

  if ((user.cash || 0) < campaign.cost) {
    return interaction.reply({
      content:
        `You need **${money(campaign.cost)}** for this campaign.\n` +
        `Your cash: **${money(user.cash || 0)}**`,
      ephemeral: true,
    });
  }

  let remainingCash;
  try {
    remainingCash = purchasePromotion({
      db,
      showId: show.id,
      userId,
      username,
      cost: campaign.cost,
      demand: campaign.demand,
    });
  } catch (error) {
    if (error.message === "PROMOTION_ALREADY_USED") {
      return interaction.reply({
        content: `**${show.name}** has already used its one promotion campaign. No cash was spent.`,
        ephemeral: true,
      });
    }
    if (error.message === "INSUFFICIENT_PROMOTION_CASH") {
      return interaction.reply({
        content: "Your balance changed before the campaign completed. No campaign was used and no cash was spent.",
        ephemeral: true,
      });
    }
    throw error;
  }

  const projectedAfterPromotion = calculateProjectedWalkins({
    baseWalkins: baseWalkins + campaign.demand,
    venue,
    ticketCount: confirmedTicketCount,
    artistDemand: Number(artist?.demand_bonus || 0),
  });
  const capacity = venueCapacity(venue);
  const attendanceBeforePromotion =
    confirmedTicketCount + projectedBeforePromotion;
  const attendanceAfterPromotion =
    confirmedTicketCount + projectedAfterPromotion;
  const effectiveAttendanceGain =
    attendanceAfterPromotion - attendanceBeforePromotion;
  const isProjectedSellout = attendanceAfterPromotion >= capacity;

  const xpUpdate = addXp(userId, 25);
  await announceLevelUp(interaction, xpUpdate);

  const embed = new EmbedBuilder()
    .setColor(0xffd000)
    .setTitle("📣 SHOW PROMOTED")
    .setDescription(`**${show.name}**`)
    .addFields(
      {
        name: "🎤 Promoter",
        value: username,
        inline: true,
      },
      {
        name: "📣 Campaign",
        value: "One venue-scaled city campaign",
        inline: false,
      },
      {
        name: "📈 Base Demand Added",
        value: `+${campaign.demand}`,
        inline: true,
      },
      {
        name: "👥 Before Promotion",
        value: `${attendanceBeforePromotion} / ${capacity} projected attendance`,
        inline: true,
      },
      {
        name: "🏟 After Promotion",
        value:
          `${attendanceAfterPromotion} / ${capacity} projected attendance` +
          (isProjectedSellout ? "\n**Projected Sellout**" : ""),
        inline: true,
      },
      {
        name: "➕ Effective Attendance Gain",
        value: `+${effectiveAttendanceGain}`,
        inline: true,
      },
      {
        name: "💸 Promo Cost",
        value: money(campaign.cost),
        inline: true,
      },
      {
        name: "💰 Remaining Cash",
        value: money(remainingCash),
        inline: true,
      },
    )
    .setFooter({
      text:
        effectiveAttendanceGain < campaign.demand
          ? `Campaign complete. It added ${campaign.demand} base demand, while venue capacity limited the effective attendance gain.`
          : "Campaign complete. This show cannot be promoted again.",
    });

  if (interaction.isButton?.()) {
    const updatedRows = interaction.message.components.map((messageRow) => {
      const components = messageRow.components.map((component) => {
        const button = ButtonBuilder.from(component);
        if (component.customId === `promote_show_${show.id}`) {
          button.setLabel("✅ Promoted").setStyle(ButtonStyle.Secondary).setDisabled(true);
        }
        return button;
      });
      return new ActionRowBuilder().addComponents(components);
    });
    await interaction.update({ components: updatedRows });
    return interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  return interaction.reply({
    embeds: [embed],
  });
}

async function promoteShow(interaction) {
  const showId = interaction.options.getString("show");
  return promoteShowById(interaction, showId);
}

module.exports = {
  createShow,
  myShows,
  runShow,
  collect,
  promoteShow,
  promoteShowById,
  announceLevelUp,
  handleShowPage,
  collectShow,
  handleBookArtistButton,
  handleArtistSelect,
};
