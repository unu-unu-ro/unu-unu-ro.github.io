// Event detail page script
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  loadEventData();
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

// Romanian month names
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

// Get slug from URL
function getSlugFromURL() {
  // URL format: event?slug-value (without key=)
  const queryString = window.location.search;
  return queryString ? queryString.substring(1) : null;
}

// Format date for display
function formatFullDate(dateStr) {
  const date = new Date(dateStr);
  return `${date.getDate()} ${MONTHS_RO[date.getMonth()]} ${date.getFullYear()}`;
}

// Format date range
function formatPeriod(startStr, endStr) {
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : null;

  const startDay = start.getDate();
  const startMonth = MONTHS_RO[start.getMonth()];
  const startYear = start.getFullYear();

  if (!end || start.getTime() === end.getTime()) {
    return `${startDay} ${startMonth} ${startYear}`;
  }

  const endDay = end.getDate();
  const endMonth = MONTHS_RO[end.getMonth()];
  const endYear = end.getFullYear();

  // Same month and year
  if (start.getMonth() === end.getMonth() && startYear === endYear) {
    return `${startDay} – ${endDay} ${startMonth} ${startYear}`;
  }

  // Same year, different months
  if (startYear === endYear) {
    return `${startDay} ${startMonth} – ${endDay} ${endMonth} ${startYear}`;
  }

  // Different years
  return `${startDay} ${startMonth} ${startYear} – ${endDay} ${endMonth} ${endYear}`;
}

// Format date for header display
function formatDateForHeader(startStr, endStr) {
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
    day: `${startDay}–${endDay}`,
    month: `${startMonth.slice(0, 3)} – ${endMonth.slice(0, 3)}`,
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

// Load event data from JSON
function loadEventData() {
  const slug = getSlugFromURL();

  if (!slug) {
    showError();
    return;
  }

  fetch("assets/data.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load data");
      return response.json();
    })
    .then((data) => {
      const event = findEventBySlug(data.sectiuni, slug);
      if (event) {
        renderEvent(event);
      } else {
        showError();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showError();
    });
}

// Find event by slug in sections
function findEventBySlug(sectiuni, slug) {
  for (const sectiune of sectiuni) {
    if (sectiune.carduri) {
      const event = sectiune.carduri.find((card) => card.slug === slug);
      if (event) return event;
    }
  }
  return null;
}

// Show error state
function showError() {
  document.getElementById("event-loading").style.display = "none";
  document.getElementById("event-error").style.display = "flex";
}

// Render event content
function renderEvent(event) {
  // Update page title
  document.title = `${event.titlu} - Unu Unu`;

  // Update meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute("content", event.info || event.titlu);
  }

  // Event type badge
  const typeEl = document.getElementById("event-type");
  if (event.tip) {
    typeEl.textContent = event.tip;
    typeEl.style.display = "inline-block";
  } else {
    typeEl.style.display = "none";
  }

  // Event status badge
  const statusEl = document.getElementById("event-status");
  const isPast = isPastEvent(event.dataEnd || event.dataStart);
  if (isPast) {
    statusEl.textContent = "Încheiat";
    statusEl.classList.add("status-past");
    statusEl.style.display = "inline-block";
  } else {
    statusEl.style.display = "none";
  }

  // Title
  document.getElementById("event-title").textContent = event.titlu;

  // Subtitle
  const subtitleEl = document.getElementById("event-subtitle");
  if (event.subtitle) {
    subtitleEl.textContent = event.subtitle;
    subtitleEl.style.display = "block";
  } else {
    subtitleEl.style.display = "none";
  }

  // Date block
  const dateDisplay = formatDateForHeader(event.dataStart, event.dataEnd);
  document.getElementById("event-date-day").textContent = dateDisplay.day;
  document.getElementById("event-date-month").textContent = dateDisplay.month;
  document.getElementById("event-date-year").textContent = dateDisplay.year;

  // Location
  const locationInline = document.getElementById("event-location-inline");
  const locationEl = document.getElementById("event-location");
  if (event.locatie) {
    locationEl.textContent = event.locatie;
    locationInline.style.display = "flex";
  } else {
    locationInline.style.display = "none";
  }

  // Description
  const descEl = document.getElementById("event-description");
  if (event.info) {
    // Handle both array and string formats
    let paragraphs;
    if (Array.isArray(event.info)) {
      paragraphs = event.info.filter((p) => p.trim());
    } else {
      paragraphs = event.info.split("\n").filter((p) => p.trim());
    }
    descEl.innerHTML = paragraphs.map((p) => `<p>${p}</p>`).join("");
  } else {
    descEl.innerHTML = "<p>Detalii suplimentare vor fi adăugate în curând.</p>";
  }

  // CTA Button
  const actionsEl = document.getElementById("event-actions");
  const ctaEl = document.getElementById("event-cta");
  const ctaTextEl = document.getElementById("event-cta-text");

  if (event.url && event.url.trim() !== "") {
    ctaEl.href = event.url;
    ctaTextEl.textContent = event.textbuton || "Detalii & înscrieri";
    actionsEl.style.display = "flex";
  } else {
    actionsEl.style.display = "none";
  }

  // Schedule widget (if schedulefile is defined)
  if (event.schedulefile && event.schedulefile.trim() !== "") {
    loadScheduleWidget(event.schedulefile);
  }

  // Share buttons
  setupShareButtons(event);

  // Show content
  document.getElementById("event-loading").style.display = "none";
  document.getElementById("event-content").style.display = "block";
}

// Setup share functionality
function setupShareButtons(event) {
  const pageUrl = window.location.href;
  const shareBtn = document.getElementById("share-native");

  // Get description text (handle both array and string)
  let description = "";
  if (event.info) {
    description = Array.isArray(event.info) ? event.info[0] : event.info;
  }

  shareBtn.addEventListener("click", async () => {
    const shareData = {
      title: event.titlu,
      text: event.subtitle || description,
      url: pageUrl,
    };

    // Use native Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or error - silently ignore
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    } else {
      // Fallback: copy link to clipboard
      try {
        await navigator.clipboard.writeText(pageUrl);
        const originalText = shareBtn.querySelector("span").textContent;
        shareBtn.querySelector("span").textContent = "Link copiat!";
        shareBtn.classList.add("copied");
        setTimeout(() => {
          shareBtn.querySelector("span").textContent = originalText;
          shareBtn.classList.remove("copied");
        }, 2000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
    }
  });
}

// Load and initialize schedule widget
async function loadScheduleWidget(scheduleFile) {
  const scheduleSection = document.getElementById("event-schedule-section");
  const scheduleContainer = document.getElementById("schedule-container");

  try {
    // Dynamically import the schedule widget module
    const { default: ScheduleWidget } =
      await import("https://ovidiuchis.github.io/orar-widget/src/schedule-widget.js");

    // Fetch the schedule data
    const response = await fetch(`schedules/${scheduleFile}`);
    if (!response.ok) {
      throw new Error("Eroare la încărcarea programului");
    }
    const data = await response.json();

    // Initialize the widget
    new ScheduleWidget({
      containerId: "schedule-container",
      data: data,
      theme: "community",
      displayMode: "tabs",
      options: {
        showSearch: false,
        showIcons: true,
        showEndTimes: true,
        showSpeakers: true,
        showLocations: true,
        language: "ro",
        timeFormat: "24h",
      },
    });

    // Show the schedule section
    scheduleSection.style.display = "block";
  } catch (error) {
    console.error("Eroare:", error);
    scheduleContainer.innerHTML =
      '<p style="text-align:center; padding: 40px; color: #e53e3e;">Eroare la încărcarea programului. Vă rugăm reîncărcați pagina.</p>';
    scheduleSection.style.display = "block";
  }
}
