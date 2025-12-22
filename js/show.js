import { getShowById, getEpisodesByShowId } from './api.js';

const params = new URLSearchParams(location.search);
const id = params.get('id');
const type = params.get('type') || "movie"; // "movie" o "tv"
const tParam = params.get('t');

const titleEl = document.querySelector('#show-title');
const imageEl = document.querySelector('#show-image');
const genresEl = document.querySelector('#show-genres');
const summaryEl = document.querySelector('#show-summary');
const siteEl = document.querySelector('#show-site');
const episodesStatusEl = document.querySelector('#episodes-status');
const episodesListEl = document.querySelector('#episodes-list');

function renderShow(data) {
  const name = data.title || data.name || "Título no disponible";
  titleEl.textContent = name;

  const imgUrl = data.poster_path 
    ? `https://image.tmdb.org/t/p/w500${data.poster_path}` 
    : null;
  imageEl.innerHTML = imgUrl
    ? `<img src="${imgUrl}" alt="${name}" class="show-poster" />`
    : `<div class="no-image">Sin imagen</div>`;

  genresEl.textContent = data.genres?.map(g => g.name).join(" · ") || "Sin géneros";
  summaryEl.innerHTML = data.overview || "Sin descripción disponible";

  if (data.homepage) {
    siteEl.href = data.homepage;
    siteEl.hidden = false;
  } else {
    siteEl.hidden = true;
  }
}

async function loadShow() {
  try {
    if (id) {
      const data = await getShowById(id, type);
      renderShow(data);
      return type === "tv" ? data.id : null; // episodios solo para series
    }

    if (tParam) {
      // fallback: buscar por título si no hay id
      const data = await getShowById(tParam, "movie");
      renderShow(data);
      return null;
    }

    titleEl.textContent = "No se especificó un show.";
    imageEl.innerHTML = `<div class="no-image">Sin imagen</div>`;
    return null;
  } catch (err) {
    console.error("Error en loadShow:", err);
    titleEl.textContent = "Error al cargar detalles.";
    imageEl.innerHTML = `<div class="no-image">Sin imagen</div>`;
    return null;
  }
}

async function loadEpisodes(showId) {
  if (!showId) {
    episodesStatusEl.textContent = "No hay episodios disponibles para este show.";
    episodesListEl.innerHTML = "";
    return;
  }

  episodesStatusEl.textContent = "Cargando episodios…";
  episodesListEl.innerHTML = "";

  try {
    const eps = await getEpisodesByShowId(showId, 1); // temporada 1 por defecto
    episodesStatusEl.textContent = "";

    if (!Array.isArray(eps) || !eps.length) {
      episodesListEl.innerHTML = '<li class="muted">No hay episodios disponibles.</li>';
      return;
    }

    episodesListEl.innerHTML = eps.map(ep => `
      <li>
        <strong>T${ep.season_number} · E${ep.episode_number}:</strong> ${ep.name}
        ${ep.air_date ? `<span class="muted"> (${ep.air_date})</span>` : ""}
      </li>
    `).join("");
  } catch (err) {
    console.error("Error en loadEpisodes:", err);
    episodesStatusEl.textContent = "";
    episodesListEl.innerHTML = '<li class="muted">No hay episodios disponibles.</li>';
  }
}

// --- Inicialización ---
(async () => {
  const showId = await loadShow();
  await loadEpisodes(showId);
})();
