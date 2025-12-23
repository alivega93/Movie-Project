import { getShowsByQuery, getTrendingDay } from "./api.js";
const sections = [
  ".hero",
  ".movies-section",
  ".series-section",
  ".recommendations-section",
  ".sports-section",
  ".tv-section",
  ".search-section",
  ".search-results",
];

function hideAllSections() {
  sections.forEach((sel) => {
    const el = document.querySelector(sel);
    if (el) el.style.display = "none";
  });
}

function setActiveNav(sectionKey) {
  document.querySelectorAll(".nav a[data-section]").forEach((a) => {
    a.classList.toggle("active", a.dataset.section === sectionKey);
  });
}

function getPoster(item) {
  if (item.poster_path) {
    if (item.poster_path.startsWith("http")) return item.poster_path;
    return `https://image.tmdb.org/t/p/w300${item.poster_path}`;
  }
  if (item.imageUrl) return item.imageUrl;
  return null;
}
function renderCards(container, items, options = {}) {
  const { clickable = false, byTitleOnly = false } = options;

  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = `<p class="empty-state">No se encontraron resultados.</p>`;
    return;
  }

  items.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    const title = item.title || item.name || "Sin título";
    const poster = getPoster(item);
    card.innerHTML = `
      ${
        poster
          ? `<img src="${poster}" alt="${title}">`
          : `<div class="no-image-card">Sin imagen</div>`
      }
      <h3>${title}</h3>
    `;

    if (clickable) {
      card.style.cursor = "pointer";
      card.addEventListener("click", () => {
        const safeTitle = title.trim();
        const type = item.media_type || (item.title ? "movie" : "tv");

        if (!byTitleOnly && item.id && (type === "movie" || type === "tv")) {
          window.location.href = `show.html?id=${item.id}&type=${type}`;
        } else {
          window.location.href = `show.html?t=${encodeURIComponent(safeTitle)}`;
        }
      });
    }

    container.appendChild(card);
  });
}

function initCarousels() {
  document.querySelectorAll(".carousel-wrapper").forEach((wrapper) => {
    const carousel = wrapper.querySelector(".carousel");
    const prev = wrapper.querySelector(".carousel-btn.prev");
    const next = wrapper.querySelector(".carousel-btn.next");

    if (!carousel) return;

    const step = () => {
      const card = carousel.querySelector(".card");
      return card ? card.offsetWidth + 16 : 180;
    };

    prev?.addEventListener("click", (e) => {
      e.preventDefault();
      carousel.scrollBy({ left: -step(), behavior: "smooth" });
    });

    next?.addEventListener("click", (e) => {
      e.preventDefault();
      carousel.scrollBy({ left: step(), behavior: "smooth" });
    });
  });
}

function initStaticCardsDetailLinks() {
  const selectors =
    ".movies-section .card, .series-section .card, .recommendations-section .card";

  document.querySelectorAll(selectors).forEach((card) => {
    const link = card.querySelector("a");
    const titleEl = card.querySelector("h3");
    const tmdbId = card.dataset.tmdbId;
    const tmdbType = card.dataset.tmdbType;

    if (!link || !titleEl) return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      const title = titleEl.textContent.trim();

      if (tmdbId && tmdbType) {
        window.location.href = `show.html?id=${tmdbId}&type=${tmdbType}`;
      } else {
        window.location.href = `show.html?t=${encodeURIComponent(title)}`;
      }
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const moviesCarousel = document.querySelector(".movies-section .carousel");
  const seriesCarousel = document.querySelector(".series-section .carousel");
  const originalMoviesHTML = moviesCarousel?.innerHTML || "";
  const originalSeriesHTML = seriesCarousel?.innerHTML || "";

  function showHome() {
    hideAllSections();

    const hero = document.querySelector(".hero");
    if (hero) hero.style.display = "block";

    const moviesSection = document.querySelector(".movies-section");
    if (moviesSection && moviesCarousel) {
      moviesSection.style.display = "block";
      moviesCarousel.innerHTML = originalMoviesHTML;
    }

    const seriesSection = document.querySelector(".series-section");
    if (seriesSection && seriesCarousel) {
      seriesSection.style.display = "block";
      seriesCarousel.innerHTML = originalSeriesHTML;
    }

    const recs = document.querySelector(".recommendations-section");
    if (recs) recs.style.display = "block";

    initStaticCardsDetailLinks();
    setActiveNav("hero");
  }

  async function showMoviesCategory() {
    hideAllSections();
    const moviesSection = document.querySelector(".movies-section");
    if (moviesSection) moviesSection.style.display = "block";
    setActiveNav("movies");

    if (!moviesCarousel) return;

    try {
      const trending = await getTrendingDay();
      const movies = (trending || [])
        .filter((i) => i.media_type === "movie" || (!i.media_type && i.title))
        .slice(0, 15);

      renderCards(moviesCarousel, movies, { clickable: true });
    } catch (err) {
      console.error(err);
      moviesCarousel.innerHTML = "<p>Error cargando películas.</p>";
    }
  }

  async function showSeriesCategory() {
    hideAllSections();
    const seriesSection = document.querySelector(".series-section");
    if (seriesSection) seriesSection.style.display = "block";
    setActiveNav("series");

    if (!seriesCarousel) return;

    try {
      const trending = await getTrendingDay();
      const series = (trending || [])
        .filter((i) => i.media_type === "tv" || (!i.media_type && i.name))
        .slice(0, 15);

      renderCards(seriesCarousel, series, { clickable: true });
    } catch (err) {
      console.error(err);
      seriesCarousel.innerHTML = "<p>Error cargando series.</p>";
    }
  }

  async function showSportsSection() {
    hideAllSections();
    const section = document.querySelector(".sports-section");
    if (section) section.style.display = "block";
    setActiveNav("deportes");

    const container = document.querySelector(".sports-section .carousel");
    if (!container) return;

    try {
      const res = await fetch(
        "https://www.thesportsdb.com/api/v1/json/3/eventspastleague.php?id=4328"
      );
      const data = await res.json();

      const items = (data.events || []).slice(0, 12).map((ev) => ({
        id: ev.idEvent,
        name: ev.strEvent,
        imageUrl: ev.strThumb
          ? ev.strThumb.replace("http://", "https://")
          : null,
      }));

      renderCards(container, items, { clickable: true, byTitleOnly: true });
    } catch (err) {
      console.error(err);
      container.innerHTML = "<p>Error cargando deportes.</p>";
    }
  }

  async function showTVSection() {
    hideAllSections();
    const section = document.querySelector(".tv-section");
    if (section) section.style.display = "block";
    setActiveNav("tv");

    const container = document.querySelector(".tv-section .carousel");
    if (!container) return;

    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(
        `https://api.tvmaze.com/schedule?country=US&date=${today}`
      );
      const data = await res.json();

      const items = (data || []).slice(0, 12).map((item) => ({
        id: item.show.id,
        name: item.show.name,
        imageUrl: item.show.image
          ? item.show.image.medium.replace("http://", "https://")
          : null,
      }));

      renderCards(container, items, { clickable: true, byTitleOnly: true });
    } catch (err) {
      console.error(err);
      container.innerHTML = "<p>Error cargando TV en vivo.</p>";
    }
  }

  initCarousels();
  initStaticCardsDetailLinks();

  const sectionParam = new URLSearchParams(location.search).get("section");
  if (sectionParam === "movies") {
    await showMoviesCategory();
  } else if (sectionParam === "series") {
    await showSeriesCategory();
  } else if (sectionParam === "deportes") {
    await showSportsSection();
  } else if (sectionParam === "tv") {
    await showTVSection();
  } else {
    showHome();
  }

  const homeLink = document.querySelector('[data-section="hero"]');
  if (homeLink) {
    homeLink.addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState({}, "", "index.html");
      showHome();
    });
  }

  const moviesLink = document.querySelector('[data-section="movies"]');
  if (moviesLink) {
    moviesLink.addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState({}, "", "index.html?section=movies");
      showMoviesCategory();
    });
  }

  const seriesLink = document.querySelector('[data-section="series"]');
  if (seriesLink) {
    seriesLink.addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState({}, "", "index.html?section=series");
      showSeriesCategory();
    });
  }

  const deportesLink = document.querySelector('[data-section="deportes"]');
  if (deportesLink) {
    deportesLink.addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState({}, "", "index.html?section=deportes");
      showSportsSection();
    });
  }

  const tvLink = document.querySelector('[data-section="tv"]');
  if (tvLink) {
    tvLink.addEventListener("click", (e) => {
      e.preventDefault();
      history.replaceState({}, "", "index.html?section=tv");
      showTVSection();
    });
  }

  const searchNavBtn = document.getElementById("nav-search");
  if (searchNavBtn) {
    searchNavBtn.addEventListener("click", (e) => {
      e.preventDefault();
      hideAllSections();
      const searchSection = document.querySelector(".search-section");
      if (searchSection) searchSection.style.display = "block";
      const input = document.getElementById("search-input");
      if (input) input.focus();
      setActiveNav(null);
    });
  }

  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("search-input");
      const query = input?.value.trim();
      if (!query) return;

      const resultsContainer = document.querySelector(
        ".search-results .carousel"
      );
      if (!resultsContainer) return;

      hideAllSections();
      const searchSection = document.querySelector(".search-section");
      const resultsSection = document.querySelector(".search-results");
      if (searchSection) searchSection.style.display = "block";
      if (resultsSection) resultsSection.style.display = "block";

      try {
        const results = await getShowsByQuery(query);
        renderCards(resultsContainer, (results || []).slice(0, 15), {
          clickable: true,
        });
      } catch (err) {
        console.error(err);
        resultsContainer.innerHTML = "<p>Error en la búsqueda.</p>";
      }
    });
  }
});
