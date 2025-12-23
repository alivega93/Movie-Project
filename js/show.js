import { getShowById, getEpisodesByShowId, getShowsByQuery } from "./api.js";
const params = new URLSearchParams(location.search);
const id = params.get("id");
const type = params.get("type") || "movie";
const tParam = params.get("t");
const titleEl = document.querySelector("#show-title");
const posterEl = document.querySelector("#show-poster");
const noImageEl = document.querySelector(".no-image");
const genresEl = document.querySelector("#show-genres");
const summaryEl = document.querySelector("#show-summary");
const siteEl = document.querySelector("#show-site");
const episodesStatusEl = document.querySelector("#episodes-status");
const episodesListEl = document.querySelector("#episodes-list");

const SPECIAL_TITLES = {
  "Lilo & Stitch": { id: 11544, type: "movie" },
  "Lilo y Stitch": { id: 11544, type: "movie" },
  "Dune 2": { id: 693134, type: "movie" },
  "Dune: Part Two": { id: 693134, type: "movie" },
};

function normalize(str) {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function showPlaceholder() {
  if (posterEl) {
    posterEl.style.display = "none";
  }
  if (noImageEl) {
    noImageEl.style.display = "flex";
  }
}

function showPoster(path, name) {
  if (!posterEl || !noImageEl) return;

  if (path) {
    posterEl.src = `https://image.tmdb.org/t/p/w500${path}`;
    posterEl.alt = `Poster de ${name}`;
    posterEl.style.display = "block";
    noImageEl.style.display = "none";
  } else {
    showPlaceholder();
  }
}

function renderShow(data, currentType) {
  const name = data.title || data.name || "Título no disponible";
  titleEl.textContent = name;
  showPoster(data.poster_path, name);

  genresEl.textContent =
    Array.isArray(data.genres) && data.genres.length
      ? data.genres.map((g) => g.name).join(" · ")
      : "Sin géneros";

  summaryEl.textContent = data.overview || "Sin descripción disponible";
  if (siteEl) {
    if (data.homepage) {
      siteEl.href = data.homepage;
      siteEl.hidden = false;
    } else {
      siteEl.hidden = true;
    }
  }
  toggleEpisodesSection(currentType === "tv");
}
function toggleEpisodesSection(show) {
  const section = document.querySelector(".episodes-section");
  if (section) section.style.display = show ? "block" : "none";
}
async function loadShow() {
  try {
    if (id) {
      const data = await getShowById(id, type);
      if (!data) throw new Error("No se encontró el show");
      renderShow(data, type);
      return type === "tv" ? data.id : null;
    }
    if (tParam) {
      const rawTitle = tParam.trim();

      if (SPECIAL_TITLES[rawTitle]) {
        const { id: specialId, type: specialType } = SPECIAL_TITLES[rawTitle];
        const data = await getShowById(specialId, specialType);
        if (!data) throw new Error("No se encontró el show especial");
        renderShow(data, specialType);
        return specialType === "tv" ? specialId : null;
      }

      const results = await getShowsByQuery(tParam);
      if (!results || results.length === 0) {
        titleEl.textContent = "No se encontraron resultados.";
        showPlaceholder();
        return null;
      }

      const normQuery = normalize(tParam);

      const candidates = results.filter(
        (r) => r.media_type === "movie" || r.media_type === "tv"
      );

      let candidate =
        candidates.find((r) =>
          [r.title, r.name, r.original_title, r.original_name]
            .map(normalize)
            .includes(normQuery)
        ) ||
        candidates[0] ||
        results[0];

      const inferredType =
        candidate.media_type || (candidate.title ? "movie" : "tv");
      const data = await getShowById(candidate.id, inferredType);
      if (!data) throw new Error("No se pudo cargar el detalle desde TMDb");

      renderShow(data, inferredType);
      return inferredType === "tv" ? candidate.id : null;
    }

    titleEl.textContent = "No se especificó un show.";
    showPlaceholder();
    return null;
  } catch (err) {
    console.error("Error en loadShow:", err);
    titleEl.textContent = "Error al cargar detalles.";
    showPlaceholder();
    return null;
  }
}
async function loadEpisodes(showId, season = 1) {
  if (!showId) {
    episodesStatusEl.textContent =
      "No hay episodios disponibles para este show.";
    episodesListEl.innerHTML = "";
    return;
  }
  episodesStatusEl.textContent = "Cargando episodios…";
  episodesListEl.innerHTML = "";
  try {
    const eps = await getEpisodesByShowId(showId, season);
    episodesStatusEl.textContent = "";
    if (!Array.isArray(eps) || eps.length === 0) {
      episodesListEl.innerHTML =
        '<li class="muted">No hay episodios disponibles.</li>';
      return;
    }
    episodesListEl.innerHTML = eps
      .map(
        (ep) => `
    <li>
      <strong>T${ep.season_number} · E${ep.episode_number}:</strong> ${ep.name}
        ${ep.air_date ? `<span class="muted"> (${ep.air_date})</span>` : ""}
    </li>
    `
      )
      .join("");
  } catch (err) {
    console.error("Error en loadEpisodes:", err);
    episodesStatusEl.textContent = "";
    episodesListEl.innerHTML =
      '<li class="muted">No hay episodios disponibles.</li>';
  }
}
(async () => {
  const showId = await loadShow();
  await loadEpisodes(showId);
})();
