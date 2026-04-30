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
  const scheduleSection = document.getElementById("orar");
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
        showHeader: false,
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

    // Build calendar modal from schedule data
    buildCalendarModal(data, scheduleFile);

    // Scroll to schedule if URL hash is #orar
    if (window.location.hash === "#orar") {
      setTimeout(() => scheduleSection.scrollIntoView({ behavior: "smooth" }), 100);
    }
  } catch (error) {
    console.error("Eroare:", error);
    scheduleContainer.innerHTML =
      '<p style="text-align:center; padding: 40px; color: #e53e3e;">Eroare la încărcarea programului. Vă rugăm reîncărcați pagina.</p>';
    scheduleSection.style.display = "block";
  }
}

// Build the calendar modal with individual activity buttons
function buildCalendarModal(scheduleData, scheduleFile) {
  const calendarBtn = document.getElementById("calendar-btn");
  const modal = document.getElementById("calendar-modal");
  const modalBody = document.getElementById("calendar-modal-body");
  const closeBtn = modal.querySelector(".calendar-modal-close");
  const backdrop = modal.querySelector(".calendar-modal-backdrop");
  const addAllBtn = document.getElementById("calendar-add-all");

  const timezone = scheduleData.eventInfo?.timezone || "Europe/Bucharest";
  const location = scheduleData.eventInfo?.location || "";
  const eventTitle = scheduleData.eventInfo?.title || "";

  // Static .ics URL if file exists in calendars/
  const staticICSUrl = scheduleFile
    ? `calendars/${scheduleFile.replace(".json", ".ics")}`
    : null;

  // Populate modal body
  modalBody.innerHTML = "";
  (scheduleData.days || []).forEach((day) => {
    if (!day.activities || day.activities.length === 0) return;

    const group = document.createElement("div");
    group.className = "calendar-day-group";

    const label = document.createElement("div");
    label.className = "calendar-day-label";
    label.textContent = day.dayLabel || day.date;
    group.appendChild(label);

    day.activities.forEach((activity) => {
      const btn = document.createElement("button");
      btn.className = "calendar-activity-btn";
      btn.innerHTML = `
        <span class="calendar-activity-icon">${activity.icon || "📅"}</span>
        <span class="calendar-activity-info">
          <span class="calendar-activity-title">${activity.title}</span>
          <span class="calendar-activity-time">${activity.startTime}${activity.endTime ? " – " + activity.endTime : ""}</span>
        </span>
        <svg class="calendar-activity-dl" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      `;
      btn.addEventListener("click", () => {
        openActivityICS(activity, day.date, location, timezone);
      });
      group.appendChild(btn);
    });

    modalBody.appendChild(group);
  });

  // Add-all button — use static file URL if available (best iOS compatibility)
  addAllBtn.addEventListener("click", () => {
    if (staticICSUrl) {
      window.location.href = staticICSUrl;
    } else {
      openAllActivitiesICS(scheduleData, location, timezone, eventTitle);
    }
  });

  // Show the calendar button
  calendarBtn.style.display = "inline-flex";

  // Open modal
  calendarBtn.addEventListener("click", () => {
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });

  // Close modal
  const closeModal = () => {
    modal.style.display = "none";
    document.body.style.overflow = "";
  };
  closeBtn.addEventListener("click", closeModal);
  backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display !== "none") closeModal();
  });
}

// Format a date+time string to ICS format: YYYYMMDDTHHMMSS
function toICSDateTime(dateStr, timeStr) {
  const [year, month, day] = dateStr.split("-");
  const [hour, minute] = timeStr.split(":");
  return `${year}${month}${day}T${hour}${minute}00`;
}

// Build a single VEVENT block string
function buildVEVENT(activity, dateStr, location, timezone) {
  const start = toICSDateTime(dateStr, activity.startTime);
  const end = activity.endTime
    ? toICSDateTime(dateStr, activity.endTime)
    : toICSDateTime(dateStr, activity.startTime);
  const uid = `${activity.id || activity.title.replace(/\s+/g, "-")}-${dateStr}@unu-unu.ro`;
  const dtstamp = toICSDateTime(
    new Date().toISOString().slice(0, 10),
    new Date().toTimeString().slice(0, 5)
  );
  const description = activity.description
    ? activity.description.replace(/,/g, "\\,").replace(/\n/g, "\\n")
    : "";
  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${timezone}:${start}`,
    `DTEND;TZID=${timezone}:${end}`,
    `SUMMARY:${activity.title.replace(/,/g, "\\,")}`,
    description ? `DESCRIPTION:${description}` : null,
    location ? `LOCATION:${location.replace(/,/g, "\\,")}` : null,
    "END:VEVENT",
  ]
    .filter(Boolean)
    .join("\r\n");
}

// Open an ICS — use a data: URI so the OS routes it to the native Calendar app
// on both iOS and Android. Browsers treat data:text/calendar as a calendar file.
function openICSBlob(icsContent, fallbackFilename) {
  window.location.href =
    "data:text/calendar;charset=utf-8," + encodeURIComponent(icsContent);
}

// Open a single activity as an ICS
function openActivityICS(activity, dateStr, location, timezone) {
  const vevent = buildVEVENT(activity, dateStr, location, timezone);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Unu Unu//Calendar//RO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    vevent,
    "END:VCALENDAR",
  ].join("\r\n");
  const safeName = activity.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
  openICSBlob(ics, `${safeName}.ics`);
}

// Open all activities across all days as one ICS
function openAllActivitiesICS(scheduleData, location, timezone, eventTitle) {
  const vevents = [];
  (scheduleData.days || []).forEach((day) => {
    (day.activities || []).forEach((activity) => {
      vevents.push(buildVEVENT(activity, day.date, location, timezone));
    });
  });
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Unu Unu//Calendar//RO",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...vevents,
    "END:VCALENDAR",
  ].join("\r\n");
  const safeName = (eventTitle || "program")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "");
  openICSBlob(ics, `${safeName}.ics`);
}
