document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  loadContentData();
});

// Mobile menu functionality
function initMobileMenu() {
  const mobileMenuButton = document.querySelector(".mobile-menu-button");
  const navMenu = document.querySelector(".nav-menu");

  if (!mobileMenuButton) return;

  mobileMenuButton.addEventListener("click", () => {
    mobileMenuButton.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  document.querySelectorAll(".nav-menu a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenuButton.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });
}

// Load and render section data
function loadContentData() {
  fetch("assets/data.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load data");
      return response.json();
    })
    .then((data) => {
      renderSections(data.sectiuni);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Romanian month names (full)
const MONTHS_RO = [
  "Ianuarie",
  "Februarie",
  "Martie",
  "Aprilie",
  "Mai",
  "Iunie",
  "Iulie",
  "August",
  "Septembrie",
  "Octombrie",
  "Noiembrie",
  "Decembrie",
];

// Format date range for display
function formatDateRange(startStr, endStr) {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;

  const startDay = start.getDate();
  const startMonth = MONTHS_RO[start.getMonth()];
  const startYear = start.getFullYear();

  if (!end || start.getTime() === end.getTime()) {
    return { day: startDay, month: startMonth, year: startYear };
  }

  const endDay = end.getDate();
  const endMonth = MONTHS_RO[end.getMonth()];

  // Same month
  if (start.getMonth() === end.getMonth()) {
    return { day: `${startDay}–${endDay}`, month: startMonth, year: startYear };
  }

  // Different months
  return {
    day: `${startDay} ${startMonth.slice(0, 3)}`,
    month: `– ${endDay} ${endMonth.slice(0, 3)}`,
    year: startYear,
  };
}

// Check if event is past
function isPastEvent(endDate) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  return now > end;
}

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens
    .trim();
}

// Render sections
function renderSections(sectiuni) {
  sectiuni.forEach((sectiune) => {
    const sectionElement = document.getElementById(sectiune.id);
    if (!sectionElement) return;

    sectionElement.innerHTML = "";

    if (sectiune.tip === "evenimente") {
      renderEventsSection(sectionElement, sectiune);
    } else {
      renderRegularSection(sectionElement, sectiune);
    }
  });
}

// Render events with Active/Past separation
function renderEventsSection(container, sectiune) {
  const events = sectiune.carduri || [];

  // Sort by date
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.dataStart) - new Date(b.dataStart),
  );

  // Separate active and past
  const activeEvents = sortedEvents.filter(
    (e) => !isPastEvent(e.dataEnd || e.dataStart),
  );
  const pastEvents = sortedEvents
    .filter((e) => isPastEvent(e.dataEnd || e.dataStart))
    .reverse();

  // Active Events Section
  if (activeEvents.length > 0) {
    const activeSection = document.createElement("div");
    activeSection.className = "events-group";

    const activeTitle = document.createElement("h3");
    activeTitle.className = "events-group-title";
    activeTitle.textContent = "Evenimente viitoare";
    activeSection.appendChild(activeTitle);

    const activeList = document.createElement("ul");
    activeList.className = "events-list";

    activeEvents.forEach((event) => {
      activeList.appendChild(createEventItem(event, false));
    });

    activeSection.appendChild(activeList);
    container.appendChild(activeSection);
  }

  // Past Events Section (collapsed by default)
  if (pastEvents.length > 0) {
    const pastSection = document.createElement("div");
    pastSection.className = "events-group events-past-group";

    const pastHeader = document.createElement("button");
    pastHeader.className = "events-group-toggle";
    pastHeader.innerHTML = `
      <span>Evenimente trecute (${pastEvents.length})</span>
      <svg class="toggle-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    `;
    pastHeader.addEventListener("click", () => {
      pastSection.classList.toggle("expanded");
    });
    pastSection.appendChild(pastHeader);

    const pastList = document.createElement("ul");
    pastList.className = "events-list past-events-list";

    pastEvents.forEach((event) => {
      pastList.appendChild(createEventItem(event, true));
    });

    pastSection.appendChild(pastList);
    container.appendChild(pastSection);
  }

  // Empty state
  if (activeEvents.length === 0 && pastEvents.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "empty-state";
    emptyState.textContent = "Nu sunt evenimente programate momentan.";
    container.appendChild(emptyState);
  }
}

// Create a single event list item (9marks style)
function createEventItem(event, isPast) {
  const li = document.createElement("li");
  li.className = "event-item" + (isPast ? " event-item-past" : "");

  const dateInfo = formatDateRange(event.dataStart, event.dataEnd);

  // Generate slug if not provided
  const slug = event.slug || generateSlug(event.titlu);

  // Link to event detail page
  const eventUrl = `/event?${encodeURIComponent(slug)}`;

  li.innerHTML = `
    <a href="${eventUrl}" class="event-item-link">
      <div class="event-date">
        <span class="event-date-day">${dateInfo.day}</span>
        <span class="event-date-month">${dateInfo.month}</span>
        <span class="event-date-year">${dateInfo.year}</span>
      </div>
      <div class="event-details">
        <h4 class="event-title">${event.titlu}</h4>
        ${event.locatie ? `<span class="event-location">${event.locatie}</span>` : ""}
        ${event.tip ? `<span class="event-type">${event.tip}</span>` : ""}
      </div>
      <span class="event-arrow">→</span>
    </a>
  `;

  return li;
}

// Render regular sections (unused, kept for future flexibility)
function renderRegularSection(container, sectiune) {
  const titleElement = document.createElement("h2");
  titleElement.textContent = sectiune.titlu;
  container.appendChild(titleElement);
}
