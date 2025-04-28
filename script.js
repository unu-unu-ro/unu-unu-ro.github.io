document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu();
  loadContentData();
  initSmoothScrolling();
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
      if (!response.ok) {
        throw new Error("Failed to load data");
      }
      return response.json();
    })
    .then((data) => {
      renderSections(data.sectiuni);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Enable smooth scrolling for anchor links
function initSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
}

// Render sections and cards from JSON data
function renderSections(sectiuni) {
  sectiuni.forEach((sectiune) => {
    const sectionElement = document.getElementById(sectiune.id);
    if (!sectionElement) return;

    // Clear current section
    sectionElement.innerHTML = "";

    // Add section title
    const titleElement = document.createElement("h2");
    titleElement.textContent = sectiune.titlu;
    sectionElement.appendChild(titleElement);

    // Generate cards if available
    if (sectiune.carduri && sectiune.carduri.length > 0) {
      const cardsContainer = document.createElement("div");
      cardsContainer.className = "cards";

      sectiune.carduri.forEach((card) => {
        cardsContainer.appendChild(createCardElement(card, sectiune.id));
      });

      sectionElement.appendChild(cardsContainer);
    }
  });
}

// Create a card element from card data
function createCardElement(card, sectionId) {
  const cardElement = document.createElement("div");
  cardElement.className = "card";

  // Add social media class if applicable
  if (card.icon) {
    cardElement.classList.add(`card-${card.icon}`);
  }

  const cardTitle = document.createElement("h3");
  cardTitle.textContent = card.titlu;

  const cardInfo = document.createElement("p");
  cardInfo.textContent = card.info;

  const cardLink = document.createElement("a");
  cardLink.href = card.url;
  cardLink.textContent = card.textbuton || "Detalii";

  // Only apply target="_blank" to external links and contacts
  if (!card.url.startsWith("#")) {
    if (sectionId === "contact") {
      cardLink.target = "_blank";
      cardLink.rel = "noopener noreferrer";
    }
  }

  cardElement.appendChild(cardTitle);
  cardElement.appendChild(cardInfo);
  cardElement.appendChild(cardLink);

  return cardElement;
}
