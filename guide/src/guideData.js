export const guideSections = [
  {
    id: "quick-start",
    category: "New Players",
    title: "Quick Start",
    summary:
      "Your first few moves in the city. Start broke, get moving, buy gear, and begin building a name.",
    commands: [
      "/journey",
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
          "You are not supposed to start rich. You are supposed to start scrappy. Work a shift, dig for records, survive weird rave stories, buy gear, throw shows, and slowly become someone the city recognizes.",
        ],
      },
      {
        heading: "Your first command",
        text: [
          "Every new player starts with /journey. It gives you one clear objective at a time and always resumes at your current step.",
          "After that, /profile is your home base. It shows your cash, XP, Scene Reputation, passive income, owned venues, owned equipment, and your next objective.",
          "If you ever feel lost, run /profile again. The profile is designed to point you toward your next real move.",
        ],
      },
      {
        heading: "Your early-game goal",
        text: [
          "At the beginning, your main goal is to buy your first piece of equipment.",
          "Gear matters because it starts equipment rental income and can later improve one venue's show attendance and production.",
        ],
      },
      {
        heading: "What to do first",
        text: [
          "Use /work to automatically play a random scene-work story for reliable starter cash and XP. Work has one shared 45-minute cooldown.",
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
      "/journey",
      "/underground_run",
      "/roles",
      "/my_shows",
    ],
    sections: [
      {
        heading: "The core progression loop",
        text: [
          "Start with work and side activities, invest the rewards in equipment, buy a venue, and turn that venue into successful shows.",
          "Each part feeds the next: active play earns resources, assets create income and unlock opportunities, and stronger events build the credibility needed for bigger goals.",
        ],
      },
      {
        heading: "1. Earn your start",
        text: [
          "Use /journey to follow the guided opening path. It connects your first controller, Street Team run, and first scene activity to one clear objective at a time.",
          "Use /work for a random scene shift with a reliable payout, and use /crate_dig and /rave_story for other early rewards. When those activities are on cooldown, /underground_run remains playable.",
        ],
      },
      {
        heading: "2. Buy equipment",
        text: [
          "Equipment is your first asset. It generates rental income and can be installed at one venue to improve its shows.",
          "Collect the income with /collect, but keep playing actively through scene activities as you work toward your first venue.",
        ],
      },
      {
        heading: "3. Buy and improve venues",
        text: [
          "Cash and Scene Reputation unlock larger venues. Venue departments improve physical capabilities such as income, capacity, and show attendance.",
          "Venues also bring management decisions: staff can improve income, incidents can temporarily close a venue, and insurance reduces that risk. Permanent staff and department upgrade prices scale with venue size.",
        ],
      },
      {
        heading: "Your borrowed-venue showcase",
        text: [
          "After completing the Journey requirements, you can play a one-time community showcase at a borrowed venue.",
          "Choose whether to focus on reading the crowd, polishing production, or building a community moment. The result introduces show-quality decisions and provides enough community backing to bridge a normal new player toward Garage Party.",
          "The borrowed room is not an owned asset and does not generate passive income. Buying Garage Party still marks the start of your real venue career.",
        ],
      },
      {
        heading: "5. Create better shows",
        text: [
          "Create shows, book a featured artist, hire show staff, and promote persistent demand before show day. Capacity limits attendance, but it does not prevent you from continuing to build stored demand.",
          "When a show completes, its rating measures attendance, profitability, production, artist choice, and staffing coverage. A strong Show Rating matters more than raw crowd size when Scene Reputation is awarded.",
        ],
      },
      {
        heading: "6. Expand your city status",
        text: [
          "XP provides unlimited player levels, while /roles tracks achievements for activity, level, and Scene Reputation milestones.",
          "Scene Reputation unlocks broader city opportunities. Strong shows generate income and credibility to reinvest in larger venues and better events.",
          "Venue Reputation is planned as a separate future measurement earned by venues through completed shows. It will eventually support sponsorships and other venue rewards, but it is not tracked yet.",
        ],
      },
      {
        heading: "When you are unsure what to do",
        text: [
          "Use /profile for your current resources and next objective, /help for system explanations, and /roles for achievement progress.",
          "The simple path is: earn, buy gear, buy a venue, build a show, improve its rating, and reinvest.",
        ],
      },
    ],
  },

  {
    id: "underground-run",
    category: "Games",
    title: "Underground Run",
    summary:
      "An always-available risk/reward activity for players who want to keep playing while other commands are on cooldown.",
    commands: ["/underground_run", "/profile", "/work"],
    sections: [
      {
        heading: "How a run works",
        text: [
          "Start an Underground Run at any time and choose one of three different situations offered for that run.",
          "The selected scenario unfolds through a short active story. At the end, choose a safe, balanced, or risky approach. More risk creates a larger possible payout, but also raises the chance that the opportunity falls apart.",
        ],
      },
      {
        heading: "One scenario, one decision",
        text: [
          "Your final approach immediately resolves the scenario, awards any cash and XP, and ends the run.",
          "A bust loses the temporary stake and possible cash reward, but never removes additional money from your regular wallet. You still keep a small amount of earned XP.",
          "After the result, start another Underground Run or return to another part of the city.",
        ],
      },
      {
        heading: "No cooldown, controlled rewards",
        text: [
          "Underground Run has no cooldown, and a player with an empty wallet can still start. A run stakes up to $25 from the wallet when available.",
          "A successful run always returns its stake in full. The first three completed runs each day pay 100% of earned profit, the next three pay 60%, and later runs pay 40%.",
          "It does not award Scene Reputation. Jobs, shows, and other city activities remain the strongest ways to make meaningful progression.",
        ],
      },
    ],
  },

  {
    id: "equipment",
    category: "Equipment",
    title: "Equipment",
    summary:
      "Rent out stored gear or install it at a venue to improve its shows.",
    commands: ["/buy_equipment", "/my_equipment", "/collect"],
    sections: [
      {
        heading: "Why equipment matters",
        text: [
          "Equipment is the first thing that makes you feel like you own something in the city.",
          "It is not just a shopping list. Gear gives you equipment rental income and makes your first venue's shows stronger once it is installed.",
        ],
      },
      {
        heading: "Equipment rental income",
        text: [
          "Stored equipment earns rental income over time. That money does not instantly go into your cash balance.",
          "Use /collect when equipment rental income is ready to collect.",
        ],
      },
      {
        heading: "Installing equipment",
        text: [
          "Once you own a venue, use /my_equipment and choose Manage Gear. You can own one of each gear type, then install or move it to one venue, or return it to rentals.",
          "Installed gear stops generating rental income. Instead, it improves attendance and production for shows hosted at that venue.",
          "The equipment screen shows every installed location and exact bonus before you make a decision.",
        ],
      },
      {
        heading: "The venue connection",
        text: [
          "Once you own a venue, /my_equipment lets you install gear there instead of collecting rental income from it.",
          "Installed gear adds its listed attendance and production effects to every show at that venue.",
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
          "Before venues, you are earning, collecting, and building momentum. After venues, you can start creating shows and shaping the scene yourself.",
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
          "Venues generate venue income.",
          "Venues let you create shows.",
          "Venues can be upgraded and staffed to become more valuable over time.",
        ],
      },
      {
        heading: "Bar programs and bartenders",
        text: [
          "The Bar Program is venue infrastructure: Beer & Wine Service grows into a Full Bar and then a Premium Cocktail Program. Each level permanently increases venue income.",
          "A Bartender is permanent venue staff. Hiring one fills a staff slot and adds a separate 5% income boost.",
          "Use /my_venues to see the Bar Program and staff contributions separately.",
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
      "Shows are scheduled events that run automatically. Venues, featured artists, staff, promotion, and payouts all come together here.",
    commands: [
      "/create_show",
      "/my_shows",
      "/promote_show",
      "/hire_show_staff",
      "/collect_show",
    ],
    sections: [
      {
        heading: "What shows are",
        text: [
          "Shows are events created at venues you own.",
          "They are one of the main ways the city starts feeling social, because shows can involve promoters, staff, attendees, and a venue-tiered artist roster.",
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
          "The city can generate automatic advance ticket sales for eligible upcoming shows without charging another player.",
          "When a show has room, sales add confirmed attendance and projected revenue. When a show is already projected at capacity, sales convert projected walk-ins into confirmed buyers without changing total attendance or projected revenue.",
          "Use /my_shows to see confirmed tickets, advance-sale revenue, projected walk-ins, and total projected attendance.",
          "Each upcoming show can receive one promotional campaign. Its price and base-demand gain scale with venue size.",
          "Use /promote_show when a show still has room. If organic momentum from activities, equipment, and advance sales has already filled the forecast, no campaign is needed.",
          "Use the Book Artist button in /my_shows to choose one featured artist from your venue's roster. The fee is paid upfront and the artist increases projected walk-ins.",
          "Use /hire_show_staff to bring in people who help the event run better.",
        ],
      },
      {
        heading: "When shows run",
        text: [
          "Shows run automatically when their assigned show time arrives.",
          "You do not manually start the show. The bot handles the show result behind the scenes.",
          "The show report scores attendance, profitability, production, artist booking, and staffing coverage, then combines them into an overall five-star rating.",
          "Well-rounded shows earn a Scene Reputation bonus, so filling the room is important but is not the only measure of success.",
          "Ratings are saved with completed shows. Your profile tracks your average, best rating, and streak of shows scoring 75 or higher.",
          "That means /create_show schedules the event, but the payout does not happen immediately.",
        ],
      },
      {
        heading: "Getting paid",
        text: [
          "Shows do not pay out instantly when you create them.",
          "After the show automatically runs and is marked completed, the owner uses /collect_show to receive the settlement and distribute staff payouts.",
          "The featured artist's fee was already paid at booking time, so the show report distinguishes the settlement from final event profit.",
        ],
      },
      {
        heading: "Why shows matter",
        text: [
          "Shows are the point where your assets turn into events.",
          "Gear, venues, featured artists, staff, promotion, and Scene Reputation all start feeding into one loop: throw better shows, earn more, reinvest, and grow the scene.",
        ],
      },
    ],
  },

  {
    id: "staff",
    category: "Shows",
    title: "Show Staff",
    summary:
      "Shows feel better when they are not just one person pressing buttons alone in the dark.",
    commands: ["/hire_show_staff", "/my_jobs", "/my_shows"],
    sections: [
      {
        heading: "Featured artists",
        text: [
          "Use the Book Artist button in /my_shows to book one venue-tiered featured artist for an upcoming show.",
          "The artist fee is paid upfront and their draw raises that show's projected walk-ins.",
        ],
      },
      {
        heading: "Show staff",
        text: [
          "Use /hire_show_staff to hire another user for an automatically assigned job such as Door Crew, Bar Support, Stage Crew, Guest Services, or Promo Crew.",
          "Each hire fills a staffing slot used by the final show rating.",
          "Assignments add identity without changing the balance: every show staff job currently pays $150.",
        ],
      },
      {
        heading: "Staff payouts",
        text: [
          "Staff receive their $150 payout when the show owner collects and settles a completed show.",
          "The basic flow is assigned, completed, then paid.",
        ],
      },
      {
        heading: "Why this system exists",
        text: [
          "A Discord game gets boring if everyone is only playing alone.",
          "Staff make shows feel less like a solo money machine. Shows need a real team behind the scenes.",
        ],
      },
    ],
  },

  {
    id: "reputation",
    category: "Mechanics",
    title: "Scene Reputation",
    summary:
      "Scene Reputation is your citywide credibility and helps unlock larger opportunities.",
    commands: ["/profile", "/roles"],
    sections: [
      {
        heading: "All progression measurements",
        text: [
          "XP raises your player level with no maximum level. Activities and shows award XP, and levels unlock achievements such as City Legend.",
          "Scene Reputation is your citywide credibility. It comes from scene activity and well-run shows, and helps unlock larger venues and progression achievements.",
          "Show Rating scores attendance, profitability, production, artist booking, and staffing coverage. Strong ratings now matter more than raw crowd size when shows award Scene Reputation.",
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
        heading: "The simple version",
        text: [
          "Scene Reputation helps the city trust you with bigger things.",
          "It grows when you participate in the city and produce strong events.",
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
          "Stored equipment earns rental income. Installed equipment improves shows at its venue instead of earning rentals. Venue income and rental income build up over time.",
        ],
      },
      {
        heading: "How to collect it",
        text: [
          "Use /collect when income is ready.",
          "Your /profile shows when passive income is Ready to Collect.",
        ],
      },
      {
        heading: "Seeing where venue income comes from",
        text: [
          "Your /profile separates base venue income from bar upgrades, permanent venue staff, and active event boosts.",
          "Use /my_venues for the same breakdown on an individual venue, including its current bar level and exact hourly contribution.",
        ],
      },
      {
        heading: "Why it exists",
        text: [
          "Passive income gives you a reason to invest in assets.",
          "But it is not supposed to replace active gameplay. The good stuff still comes from making choices, throwing shows, and expanding.",
        ],
      },
    ],
  },

  {
    id: "payouts",
    category: "Economy",
    title: "Show Payouts",
    summary:
      "Shows have their own payout flow so owners and staff can be part of the event economy.",
    commands: ["/collect_show", "/my_shows", "/my_jobs"],
    sections: [
      {
        heading: "Completed shows",
        text: [
          "A show has to complete before payouts are settled.",
          "Once it is complete, the owner can use /collect_show to settle the show and process every payout.",
        ],
      },
      {
        heading: "Staff payouts",
        text: [
          "When the owner collects the completed show, staff payouts are settled too.",
          "This keeps the event economy tied to the show lifecycle instead of paying everyone instantly before the event actually happens.",
        ],
      },
      {
        heading: "Why this matters",
        text: [
          "The goal is to make shows feel like actual events, not just buttons that print money.",
          "Create the show, book an artist, promote it, let it run, then collect and settle up.",
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
          "Use /venue_insurance to buy 48 hours of coverage for a venue. The price scales with the size of the venue.",
          "Coverage reduces incident risk by 35% and cuts closure time by 50% when things go wrong.",
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
        heading: "How do I book an artist?",
        text: [
          "You need an upcoming show at a venue you own.",
          "Open /my_shows, choose the show, then use its Book Artist button.",
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
