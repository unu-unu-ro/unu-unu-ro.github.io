document.addEventListener("DOMContentLoaded", () => {
  // Funcționalitate pentru meniul mobil
  const mobileMenuButton = document.querySelector(".mobile-menu-button");
  const navMenu = document.querySelector(".nav-menu");

  if (mobileMenuButton) {
    mobileMenuButton.addEventListener("click", () => {
      mobileMenuButton.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Închide meniul după ce se face click pe un link
    document.querySelectorAll(".nav-menu a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenuButton.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }

  // Încărcarea datelor din JSON
  fetch("assets/data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Eroare la încărcarea datelor");
      }
      return response.json();
    })
    .then((data) => {
      renderSections(data.sectiuni);
    })
    .catch((error) => {
      console.error("Eroare:", error);
    });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      document.querySelector(this.getAttribute("href")).scrollIntoView({
        behavior: "smooth",
      });
    });
  });
});

// Funcție pentru afișarea secțiunilor și cardurilor
function renderSections(sectiuni) {
  sectiuni.forEach((sectiune) => {
    const sectionElement = document.getElementById(sectiune.id);

    if (!sectionElement) return;

    // Curățăm secțiunea actuală
    while (sectionElement.firstChild) {
      sectionElement.removeChild(sectionElement.firstChild);
    }

    // Adăugăm titlul secțiunii
    const titleElement = document.createElement("h2");
    titleElement.textContent = sectiune.titlu;
    sectionElement.appendChild(titleElement);

    // Verificăm dacă avem carduri de afișat
    if (sectiune.carduri) {
      const cardsContainer = document.createElement("div");
      cardsContainer.className = "cards";

      // Generăm cardurile pentru această secțiune
      sectiune.carduri.forEach((card) => {
        const cardElement = document.createElement("div");
        cardElement.className = "card";

        const cardTitle = document.createElement("h3");
        cardTitle.textContent = card.titlu;

        const cardInfo = document.createElement("p");
        cardInfo.textContent = card.info;

        const cardLink = document.createElement("a");
        cardLink.href = card.url;

        // Folosim textbuton dacă există, altfel folosim "Detalii"
        cardLink.textContent = card.textbuton ? card.textbuton : "Detalii";

        // Nu aplicăm target="_blank" pentru link-urile interne (care încep cu #)
        if (!card.url.startsWith("#")) {
          cardLink.target = "_blank";
          cardLink.rel = "noopener noreferrer"; // Bună practică pentru securitate
        }

        // Adăugăm icoane pentru cardurile de social media, dacă există
        if (card.icon) {
          cardElement.classList.add(`card-${card.icon}`);
        }

        cardElement.appendChild(cardTitle);
        cardElement.appendChild(cardInfo);
        cardElement.appendChild(cardLink);

        cardsContainer.appendChild(cardElement);
      });

      sectionElement.appendChild(cardsContainer);
    }
  });
}
