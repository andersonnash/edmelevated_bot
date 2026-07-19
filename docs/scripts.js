document.addEventListener("DOMContentLoaded", () => {
  const districts = {
    garage: {
      tier: "Starter Venue",
      name: "🏚 Garage District",
      description:
        "Every legend starts somewhere slightly unsafe, underfunded, and full of extension cords. The Garage District is where broke ravers become promoters.",
      venue: "Garage Party",
      rumor: "“If the cops do not show up, was it even a garage party?”",
      hint: "Start here after earning cash and buying your first gear.",
    },
    warehouse: {
      tier: "Reputation Unlock",
      name: "🏭 Warehouse Row",
      description:
        "The city pretends it does not know these parties happen. Everyone else knows exactly where to park.",
      venue: "Granary Warehouse",
      rumor:
        "“Security looking calm means the party is either dead or legendary.”",
      hint: "Build reputation before trying to move into bigger rooms.",
    },
    subroom: {
      tier: "Mid-Scene Stronghold",
      name: "🕳 The Sub Room",
      description:
        "A basement club with loyal regulars, questionable lighting, and a sound system that makes normal conversation impossible.",
      venue: "The Sub Room",
      rumor:
        "“The left speaker only works when the DJ is nervous. Nobody can explain it.”",
      hint: "Upgrade production and security when your shows start getting bigger.",
    },
    rooftop: {
      tier: "High-Status Venue",
      name: "🌃 Neon Rooftop",
      description:
        "City views, cleaner bathrooms, bigger budgets, and people pretending they were underground the whole time.",
      venue: "Neon Rooftop",
      rumor:
        "“Bottle-service weirdos and bass heads can coexist, but only after midnight.”",
      hint: "Higher-tier venues need stronger reputation and more cash.",
    },
    desert: {
      tier: "Endgame Venue",
      name: "🏜 Desert Frequency",
      description:
        "A massive desert-scale event space for the kind of show people talk about like it was a weather event.",
      venue: "Desert Frequency",
      rumor:
        "“Someone once lost a USB drive here and accidentally invented a genre.”",
      hint: "This is long-term expansion territory. Build venues, shows, staff, and reputation first.",
    },
  };

  const districtButtons = document.querySelectorAll("[data-district]");
  const districtTier = document.querySelector("#districtTier");
  const districtName = document.querySelector("#districtName");
  const districtDescription = document.querySelector("#districtDescription");
  const districtVenue = document.querySelector("#districtVenue");
  const districtRumor = document.querySelector("#districtRumor");
  const districtHint = document.querySelector("#districtHint");

  if (
    !districtButtons.length ||
    !districtTier ||
    !districtName ||
    !districtDescription ||
    !districtVenue ||
    !districtRumor ||
    !districtHint
  ) {
    return;
  }

  districtButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const district = districts[button.dataset.district];

      if (!district) return;

      districtButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      districtTier.textContent = district.tier;
      districtName.textContent = district.name;
      districtDescription.textContent = district.description;
      districtVenue.textContent = district.venue;
      districtRumor.textContent = district.rumor;
      districtHint.textContent = district.hint;
    });
  });
});
