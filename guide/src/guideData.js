export const guideSections = [
  {
    id: "quick-start",
    category: "New Players",
    title: "Quick Start",
    summary:
      "Your first few moves in the city. Start broke, get moving, buy gear, and begin building a name.",
    commands: [
      "/profile",
      "/help",
      "/work",
      "/crate_dig",
      "/rave_story",
      "/buy_equipment",
    ],
    sections: [
      {
        heading: "Welcome to the city",
        text: [
          "EDMELEVATED City is a Discord game about building your way into the underground EDM scene.",
          "You are not supposed to start rich. You are supposed to start scrappy. Work a shift, dig for records, survive weird rave stories, buy gear, take bookings, throw shows, and slowly become someone the city recognizes.",
        ],
      },
      {
        heading: "Your first command",
        text: [
          "Start with /profile. This is your home base. It shows your cash, XP, Scene Reputation, passive income, owned venues, owned equipment, and your next objective.",
          "If you ever feel lost, run /profile again. The profile is designed to point you toward your next real move.",
        ],
      },
      {
        heading: "Your early-game goal",
        text: [
          "At the beginning, your main goal is to buy your first piece of equipment.",
          "Gear matters because it starts passive income and unlocks DJ bookings. That is when the game starts opening up.",
        ],
      },
      {
        heading: "What to do first",
        text: [
          "Use /work for reliable starter cash.",
          "Use /crate_dig and /rave_story for more flavorful side activities.",
          "Once you have enough money, use /buy_equipment to buy your first controller and start building momentum.",
        ],
      },
    ],
  },

  {
    id: "progression",
    category: "Progression",
    title: "Game Progression",
    summary:
      "The complete path from working your first shift to running venues, producing strong shows, and becoming a city legend.",
    commands: [
      "/profile",
      "/help",
      "/roles",
      "/bookings",
      "/my_shows",
    ],
    sections: [
      {
        heading: "The core progression loop",
        text: [
          "Start with work and side activities, invest the rewards in equipment, build a DJ career through bookings, buy a venue, and turn that venue into successful shows.",
          "Each part feeds the next: active play earns resources, assets create income and unlock opportunities, and stronger events build the credibility needed for bigger goals.",
        ],
      },
      {
        heading: "1. Earn your start",
        text: [
          "Use /work, /crate_dig, and /rave_story to earn your first cash and XP while beginning to build Scene Reputation.",
          "Your immediate goal is to afford equipment. /profile shows your current resources and points toward a useful next step.",
        ],
      },
      {
        heading: "2. Buy equipment",
        text: [
          "Equipment is your first asset. It generates passive rental income and unlocks the DJ booking path.",
          "Collect the income with /collect, but keep playing actively: bookings are the main bridge between early gear ownership and your first venue.",
        ],
      },
      {
        heading: "3. Build your DJ career",
        text: [
          "Career milestones and repeatable gigs award cash, XP, DJ Reputation, Completed Gigs, and sometimes demand for your next owned show.",
          "DJ Reputation and repeatable-gig progress unlock later career milestones. Completed Gigs and DJ Reputation also raise your booking value.",
        ],
      },
      {
        heading: "4. Buy and improve venues",
        text: [
          "Cash and Scene Reputation unlock larger venues. Venue departments improve physical capabilities such as income, capacity, and show attendance.",
          "Venues also bring management decisions: staff can improve income, incidents can temporarily close a venue, and insurance reduces that risk.",
        ],
      },
      {
        heading: "5. Create better shows",
        text: [
          "Create shows, build lineups, hire staff, and promote persistent demand before show day. Capacity limits attendance, but it does not prevent you from continuing to build stored demand.",
          "When a show completes, its rating measures attendance, profitability, production, lineup coverage, and staffing coverage. A strong Show Rating matters more than raw crowd size when Scene Reputation is awarded.",
        ],
      },
      {
        heading: "6. Expand your city status",
        text: [
          "XP provides unlimited player levels, while /roles tracks achievements for activity, level, and Scene Reputation milestones.",
          "Scene Reputation unlocks broader city opportunities. DJ Reputation and Completed Gigs advance the separate artist path. Strong shows generate income and credibility to reinvest in larger venues and better events.",
          "Venue Reputation is planned as a separate future measurement earned by venues through completed shows. It will eventually support sponsorships and other venue rewards, but it is not tracked yet.",
        ],
      },
      {
        heading: "When you are unsure what to do",
        text: [
          "Use /profile for your current resources and next objective, /help for system explanations, and /roles for achievement progress.",
          "The simple path is: earn, buy gear, take gigs, buy a venue, build a show, improve its rating, and reinvest.",
        ],
      },
    ],
  },

  {
    id: "equipment",
    category: "Equipment",
    title: "Equipment",
    summary:
      "Gear is your first real asset. It earns passive income and unlocks the DJ career path.",
    commands: ["/buy_equipment", "/my_equipment", "/collect", "/bookings"],
    sections: [
      {
        heading: "Why equipment matters",
        text: [
          "Equipment is the first thing that makes you feel like you own something in the city.",
          "It is not just a shopping list. Gear gives you passive rental income and unlocks DJ bookings, which gives you something active to do before you can afford a venue.",
        ],
      },
      {
        heading: "Passive income",
        text: [
          "Owned equipment earns money over time. That money does not instantly go into your cash balance.",
          "Use /collect to claim passive income when it is ready.",
        ],
      },
      {
        heading: "The first big unlock",
        text: [
          "Once you own equipment, /profile should start pointing you toward /bookings.",
          "That is intentional. The game should not feel like buy gear, stare at the wall, wait for venue money. Bookings are there to keep the early game moving.",
        ],
      },
    ],
  },

  {
    id: "bookings",
    category: "DJ Career",
    title: "DJ Bookings",
    summary:
      "Bookings bridge the gap between owning equipment and buying your first venue.",
    commands: ["/bookings", "/dj_profile", "/top_djs"],
    sections: [
      {
        heading: "What bookings are",
        text: [
          "Bookings are the beginning of the DJ career path.",
          "They are designed to give players something active and meaningful to do after buying equipment but before owning a venue.",
        ],
      },
      {
        heading: "Why they were added",
        text: [
          "Before bookings, the early game could feel like this: buy gear, wait for passive income, grind until venue.",
          "That works mechanically, but it is not very exciting. Bookings make that part of the game feel more like actually building a name in the scene.",
        ],
      },
      {
        heading: "How bookings work",
        text: [
          "Once you own equipment, run /bookings.",
          "The first available opportunity is Open Decks Guest Slot.",
          "You choose a genre, choose how you want to open your set, and complete the booking for rewards.",
          "Open Decks leads into Private Party, Local Club Support, and Warehouse Closing Slot milestones.",
          "Each booking presents a situation and three choices written specifically for that gig.",
        ],
      },
      {
        heading: "What your first booking does",
        text: [
          "Completing your first booking creates your DJ profile.",
          "It gives cash, XP, Scene Reputation, DJ Reputation, and increases your Completed Gigs count.",
          "It also raises your booking fee, which makes your DJ career feel like it is actually growing.",
        ],
      },
      {
        heading: "One-time versus repeatable",
        text: [
          "Career milestones are completed once, do not use a cooldown, and advance the path toward the next career booking.",
          "The next milestone does not unlock immediately: it requires a certain number of completed repeatable gigs and enough DJ Reputation.",
          "Repeatable DJ gigs are separate buttons that remain available after they unlock.",
          "Repeatable gigs unlock as you clear milestones, scale their cash with DJ Reputation, and can add demand to your next owned show.",
          "All repeatable gigs share one cooldown: you can complete one every six hours and no more than three per UTC day.",
        ],
      },
      {
        heading: "Career requirements",
        text: [
          "Open Decks unlocks Community Night. Complete 2 repeatable gigs and reach 15 DJ Reputation to unlock Private Party.",
          "Private Party unlocks Afterparty Set. Complete 4 repeatable gigs total and reach 35 DJ Reputation to unlock Local Club Support.",
          "Local Club Support unlocks Club Support Slot. Complete 8 repeatable gigs total and reach 70 DJ Reputation to unlock Warehouse Closing Slot.",
          "Warehouse Closing Slot unlocks Underground Genre Showcase as the final repeatable tier.",
        ],
      },
    ],
  },

  {
    id: "dj-profile",
    category: "DJ Career",
    title: "DJ Profile",
    summary:
      "Your DJ profile tracks who you are as an artist: DJ Reputation, Completed Gigs, level, and fee.",
    commands: ["/dj_profile", "/top_djs", "/bookings"],
    sections: [
      {
        heading: "Your artist identity",
        text: [
          "Your DJ profile is separate from your regular player profile.",
          "Your regular profile shows your overall city progress. Your DJ profile shows your career as an artist.",
        ],
      },
      {
        heading: "What it tracks",
        text: [
          "DJ Reputation shows how much credibility you have as a DJ.",
          "Completed Gigs includes career bookings, repeatable bookings, and completed show-lineup appearances.",
          "Your booking fee shows how valuable your name is becoming.",
        ],
      },
      {
        heading: "How to grow it",
        text: [
          "Use /bookings to build your DJ career directly.",
          "Getting added to show lineups also helps connect your DJ identity to the wider scene.",
          "The long-term goal is for your name to mean something when it shows up on a lineup.",
        ],
      },
    ],
  },

  {
    id: "venues",
    category: "Venues",
    title: "Venues",
    summary:
      "Venues are where you stop just surviving and start building your own corner of the city.",
    commands: [
      "/buy_venue",
      "/my_venues",
      "/upgrade_venue",
      "/hire_venue_staff",
      "/venue_insurance",
    ],
    sections: [
      {
        heading: "Why venues matter",
        text: [
          "Buying a venue is one of the biggest early milestones in the game.",
          "Before venues, you are earning, collecting, and taking bookings. After venues, you can start creating shows and shaping the scene yourself.",
        ],
      },
      {
        heading: "Your first venue",
        text: [
          "The first venue is Garage Party.",
          "It is small, cheap, scrappy, and exactly where a broke promoter should start.",
        ],
      },
      {
        heading: "What venues do",
        text: [
          "Venues generate passive income.",
          "Venues let you create shows.",
          "Venues can be upgraded and staffed to become more valuable over time.",
        ],
      },
      {
        heading: "Growing into bigger rooms",
        text: [
          "Higher-tier venues require more cash and Scene Reputation.",
          "That means you cannot just buy your way into the biggest spaces immediately. You have to build enough credibility for the city to let you move up.",
        ],
      },
    ],
  },

  {
    id: "shows",
    category: "Shows",
    title: "Shows",
    summary:
      "Shows are scheduled events that run automatically. Venues, DJs, staff, promotion, and payouts all come together here.",
    commands: [
      "/create_show",
      "/my_shows",
      "/promote_show",
      "/add_lineup",
      "/hire_staff",
      "/collect_show",
    ],
    sections: [
      {
        heading: "What shows are",
        text: [
          "Shows are events created at venues you own.",
          "They are one of the main ways the city starts feeling social, because shows can involve promoters, DJs, staff, and attendees.",
        ],
      },
      {
        heading: "Building a show",
        text: [
          "Use /create_show to choose a venue, genre, ticket price, and optional custom name.",
          "Lower ticket prices increase initial demand. Higher prices reduce demand but earn more per attendee.",
          "When the show is created, the bot automatically assigns it a future show date and time.",
          "You are not picking the exact date yourself. You are creating the event, and the city puts it on the calendar.",
        ],
      },
      {
        heading: "Before the show runs",
        text: [
          "Once a show exists, you can build it up before it happens.",
          "Use /promote_show to increase walk-ins.",
          "Use /add_lineup to add DJs.",
          "Use /hire_staff to bring in people who help the event run better.",
        ],
      },
      {
        heading: "When shows run",
        text: [
          "Shows run automatically when their assigned show time arrives.",
          "You do not manually start the show. The bot handles the show result behind the scenes.",
          "The show report scores attendance, profitability, production, lineup coverage, and staffing coverage, then combines them into an overall five-star rating.",
          "Well-rounded shows earn a Scene Reputation bonus, so filling the room is important but is not the only measure of success.",
          "Ratings are saved with completed shows. Your profile tracks your average, best rating, and streak of shows scoring 75 or higher.",
          "That means /create_show schedules the event, but the payout does not happen immediately.",
        ],
      },
      {
        heading: "Getting paid",
        text: [
          "Shows do not pay out instantly when you create them.",
          "After the show automatically runs and is marked completed, the owner uses /collect_show to collect profits and settle payouts.",
          "This is also when DJ and staff payouts are settled for that completed show.",
        ],
      },
      {
        heading: "Why shows matter",
        text: [
          "Shows are the point where your assets turn into events.",
          "Gear, venues, DJs, staff, promotion, and Scene Reputation all start feeding into one loop: throw better shows, earn more, reinvest, and grow the scene.",
        ],
      },
    ],
  },

  {
    id: "staff",
    category: "Shows",
    title: "Staff & Lineups",
    summary:
      "Shows feel better when they are not just one person pressing buttons alone in the dark.",
    commands: ["/add_lineup", "/show_lineup", "/hire_staff", "/my_jobs"],
    sections: [
      {
        heading: "Lineups",
        text: [
          "Use /add_lineup to add another Discord user as a DJ on your show.",
          "This helps shows feel more like actual community events instead of solo money machines.",
        ],
      },
      {
        heading: "Show staff",
        text: [
          "Use /hire_staff to hire another user for a show staff role.",
          "Staff roles help events feel more alive and create more ways for players to participate even if they do not own venues yet.",
        ],
      },
      {
        heading: "Staff payouts",
        text: [
          "Staff are paid when the show owner collects and settles a completed show.",
          "The basic flow is assigned, completed, then paid.",
        ],
      },
      {
        heading: "Why this system exists",
        text: [
          "A Discord game gets boring if everyone is only playing alone.",
          "Lineups and staff are meant to make the city feel social. Promoters need DJs. Shows need staff. The scene works better when people are connected.",
        ],
      },
    ],
  },

  {
    id: "reputation",
    category: "Mechanics",
    title: "Scene Reputation vs DJ Reputation",
    summary:
      "There are two player reputation tracks, and they matter in different ways.",
    commands: ["/profile", "/dj_profile", "/bookings"],
    sections: [
      {
        heading: "All progression measurements",
        text: [
          "XP raises your player level with no maximum level. Activities and shows award XP, and levels unlock achievements such as City Legend.",
          "Scene Reputation is your citywide credibility. It comes from scene activity, bookings, and well-run shows, and helps unlock larger venues and progression achievements.",
          "DJ Reputation measures your artist career. It helps determine DJ status, booking value, and career-milestone access.",
          "Completed Gigs counts career bookings, repeatable bookings, and completed show-lineup appearances. Each completed gig also increases booking value.",
          "Show Rating scores attendance, profitability, production, lineup coverage, and staffing coverage. Strong ratings now matter more than raw crowd size when shows award Scene Reputation.",
          "Venue Reputation is planned as a separately stored future measurement for sponsorships and other venue rewards. Department upgrades remain physical improvements and do not currently create Venue Reputation.",
        ],
      },
      {
        heading: "Scene Reputation",
        text: [
          "Scene Reputation is your overall credibility in EDMELEVATED City.",
          "It helps represent your general progress as a player and can matter for unlocking bigger opportunities, like better venues.",
        ],
      },
      {
        heading: "DJ Reputation",
        text: [
          "DJ Reputation is specific to your artist career.",
          "It affects your DJ level, your booking fee, and how strong your DJ profile looks.",
        ],
      },
      {
        heading: "Why they are separate",
        text: [
          "Being a good promoter and being a respected DJ are related, but they are not the exact same thing.",
          "The game separates these so the DJ career path can grow without making it identical to venue ownership or general progression.",
        ],
      },
      {
        heading: "The simple version",
        text: [
          "Scene Reputation helps the city trust you with bigger things.",
          "DJ Reputation helps people take you seriously behind the decks.",
        ],
      },
    ],
  },

  {
    id: "passive-income",
    category: "Economy",
    title: "Passive Income",
    summary:
      "Equipment and venues earn money over time, but you still have to collect it.",
    commands: ["/collect", "/my_equipment", "/my_venues", "/profile"],
    sections: [
      {
        heading: "What passive income is",
        text: [
          "Passive income is money generated by assets you own.",
          "Equipment can earn rental income. Venues can earn venue income. Both build up over time.",
        ],
      },
      {
        heading: "How to collect it",
        text: [
          "Use /collect when income is ready.",
          "Your /profile should show when there is passive income waiting for you.",
        ],
      },
      {
        heading: "Why it exists",
        text: [
          "Passive income gives you a reason to invest in assets.",
          "But it is not supposed to replace active gameplay. The good stuff still comes from making choices, taking bookings, throwing shows, and expanding.",
        ],
      },
    ],
  },

  {
    id: "payouts",
    category: "Economy",
    title: "Show Payouts",
    summary:
      "Shows have their own payout flow so owners, DJs, and staff can all be part of the event economy.",
    commands: ["/collect_show", "/my_shows", "/my_jobs", "/show_lineup"],
    sections: [
      {
        heading: "Completed shows",
        text: [
          "A show has to complete before payouts are settled.",
          "Once it is complete, the owner can use /collect_show to collect the show profit.",
        ],
      },
      {
        heading: "Staff and DJ payouts",
        text: [
          "When the owner collects the completed show, staff and DJ payouts are settled too.",
          "This keeps the event economy tied to the show lifecycle instead of paying everyone instantly before the event actually happens.",
        ],
      },
      {
        heading: "Why this matters",
        text: [
          "The goal is to make shows feel like actual events, not just buttons that print money.",
          "Create the show, build the lineup, promote it, let it run, then collect and settle up.",
        ],
      },
    ],
  },

  {
    id: "venue-events",
    category: "Venues",
    title: "Venue Events & Insurance",
    summary:
      "Venues can run into problems, but not every city event is bad. Sometimes the chaos works in your favor.",
    commands: ["/venue_insurance", "/my_venues"],
    sections: [
      {
        heading: "What venue events are",
        text: [
          "Owning venues means dealing with the city around them. Sometimes that means problems. Sometimes it means unexpected momentum.",
          "Venue events are random things that can happen to your venues over time. They are meant to make venue ownership feel alive instead of completely predictable.",
        ],
      },
      {
        heading: "Negative venue events",
        text: [
          "Some events can hurt your venue. A venue might lose income, run into trouble, or be temporarily closed.",
          "This adds risk to owning spaces. Bigger progression should feel exciting, but it should not feel completely safe.",
        ],
      },
      {
        heading: "Positive venue events",
        text: [
          "Not every event is bad. Sometimes a venue gets a lucky break, extra attention, a boost, or some kind of scene momentum.",
          "Positive events are there to make the city feel less like a punishment machine and more like a chaotic scene where good surprises can happen too.",
        ],
      },
      {
        heading: "Insurance",
        text: [
          "Use /venue_insurance to buy coverage for a venue.",
          "Insurance is mainly there to protect you from the rougher side of venue ownership. It can reduce incident risk and closure time when things go wrong.",
        ],
      },
      {
        heading: "Why this exists",
        text: [
          "Venues should feel powerful, but not effortless.",
          "The goal is to make owning spaces feel like managing a real part of the city: sometimes messy, sometimes lucky, sometimes expensive, and occasionally very worth it.",
        ],
      },
    ],
  },

  {
    id: "faq",
    category: "FAQ",
    title: "Common Questions",
    summary:
      "Quick answers for the questions people are probably going to ask after five minutes in the city.",
    commands: ["/profile", "/help"],
    sections: [
      {
        heading: "Why can’t I take a booking?",
        text: [
          "You need to own equipment first.",
          "Buy gear with /buy_equipment, then run /bookings.",
        ],
      },
      {
        heading: "Why can’t I create a show?",
        text: [
          "You need to own a venue first.",
          "Save for Garage Party, buy it with /buy_venue, then use /create_show.",
        ],
      },
      {
        heading: "Why does /profile keep telling me what to do?",
        text: [
          "That is intentional.",
          "/profile is meant to be your dashboard and your compass. If you are lost, it should point you toward the next useful milestone.",
        ],
      },
      {
        heading: "Is everything final?",
        text: [
          "No. This is an early playtest.",
          "Rewards, cooldowns, payouts, commands, and balance can all change as the city gets tested.",
        ],
      },
    ],
  },
];
