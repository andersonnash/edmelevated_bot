import { useEffect, useMemo, useState } from "react";
import { guideSections } from "./guideData";

const categories = [
  "All",
  ...new Set(guideSections.map((section) => section.category)),
];

function App() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSectionId, setActiveSectionId] = useState(guideSections[0].id);

  const filteredSections = useMemo(() => {
    const query = search.trim().toLowerCase();

    return guideSections.filter((section) => {
      const matchesCategory =
        activeCategory === "All" || section.category === activeCategory;

      const searchableText = [
        section.title,
        section.category,
        section.summary,
        section.commands.join(" "),
        section.sections
          .flatMap((guideSection) => [
            guideSection.heading,
            ...guideSection.text,
          ])
          .join(" "),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  useEffect(() => {
    if (!filteredSections.length) return;

    const activeIsVisible = filteredSections.some(
      (section) => section.id === activeSectionId,
    );

    if (!activeIsVisible) {
      setActiveSectionId(filteredSections[0].id);
    }
  }, [activeSectionId, filteredSections]);

  const activeSection =
    guideSections.find((section) => section.id === activeSectionId) ||
    guideSections[0];

  function selectSection(sectionId) {
    setActiveSectionId(sectionId);
  }

  return (
    <main className="guide-shell">
      <header className="guide-hero">
        <a className="home-link" href="../">
          ← Back to City
        </a>

        <p className="eyebrow">Full Player Guide</p>
        <h1>EDMELEVATED City Guide</h1>
        <p>
          A deeper explanation of the systems behind the bot: equipment, DJ
          bookings, venues, shows, reputation, payouts, and progression.
        </p>
      </header>

      <section className="guide-layout">
        <aside className="guide-sidebar">
          <label htmlFor="guide-search">Search the guide</label>
          <input
            id="guide-search"
            type="search"
            placeholder="Search bookings, venues, reputation..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <div className="category-list" aria-label="Guide categories">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={category === activeCategory ? "active" : ""}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <nav className="section-list" aria-label="Guide sections">
            {filteredSections.map((section) => (
              <button
                key={section.id}
                type="button"
                className={section.id === activeSection.id ? "active" : ""}
                onClick={() => selectSection(section.id)}
              >
                <span>{section.category}</span>
                {section.title}
              </button>
            ))}

            {!filteredSections.length && (
              <p className="empty-state">
                No guide sections match that search.
              </p>
            )}
          </nav>
        </aside>

        <article className="guide-content">
          <p className="section-category">{activeSection.category}</p>
          <h2>{activeSection.title}</h2>
          <p className="section-summary">{activeSection.summary}</p>

          <div className="command-pills">
            {activeSection.commands.map((command) => (
              <code key={command}>{command}</code>
            ))}
          </div>

          <div className="guide-body">
            {activeSection.sections.map((section) => (
              <section className="guide-section-block" key={section.heading}>
                <h3>{section.heading}</h3>
                {section.text.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;
