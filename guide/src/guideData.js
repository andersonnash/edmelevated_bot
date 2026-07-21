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
          "Start with /profile. This is your home base. It shows your cash, XP, reputation, passive income, owned venues, owned equipment, and your next objective.",
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
    id: "equipment",
    category: "Progression",
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
        ],
      },
      {
        heading: "What your first booking does",
        text: [
          "Completing your first booking creates your DJ profile.",
          "It gives cash, XP, scene reputation, DJ reputation, and increases your completed bookings count.",
          "It also raises your booking fee, which makes your DJ career feel like it is actually growing.",
        ],
      },
      {
        heading: "Version one",
        text: [
          "Right now, bookings are still early. Open Decks Guest Slot is the first version of the system.",
          "More booking opportunities can be added later, but the foundation is now there: gear leads to bookings, bookings build your DJ name, and your DJ profile tracks the climb.",
        ],
      },
    ],
  },

  {
    id: "dj-profile",
    category: "DJ Career",
    title: "DJ Profile",
    summary:
      "Your DJ profile tracks who you are as an artist: reputation, bookings, level, and fee.",
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
          "DJ reputation shows how much credibility you have as a DJ.",
          "Completed bookings show how many opportunities you have played.",
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
          "Higher-tier venues require more cash and reputation.",
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
          "Well-rounded shows earn a reputation bonus, so filling the room is important but is not the only measure of success.",
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
          "Gear, venues, DJs, staff, promotion, and reputation all start feeding into one loop: throw better shows, earn more, reinvest, and grow the scene.",
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
    title: "Reputation vs DJ Reputation",
    summary:
      "There are two reputation tracks, and they matter in different ways.",
    commands: ["/profile", "/dj_profile", "/bookings"],
    sections: [
      {
        heading: "Scene reputation",
        text: [
          "Scene reputation is your overall credibility in EDMELEVATED City.",
          "It helps represent your general progress as a player and can matter for unlocking bigger opportunities, like better venues.",
        ],
      },
      {
        heading: "DJ reputation",
        text: [
          "DJ reputation is specific to your artist career.",
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
          "Scene reputation helps the city trust you with bigger things.",
          "DJ reputation helps people take you seriously behind the decks.",
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
