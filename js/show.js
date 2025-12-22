import { getShowById, getEpisodesByShowId, getShowsByQuery } from './api.js';

const params = new URLSearchParams(location.search);
const rawId = params.get('id');
const id = rawId && Number.isInteger(Number(rawId)) && Number(rawId) > 0 ? Number(rawId) : null;
const tParam = params.get('t');

const titleEl = document.querySelector('#show-title');
const imageEl = document.querySelector('#show-image');
const genresEl = document.querySelector('#show-genres');
const summaryEl = document.querySelector('#show-summary');
const siteEl = document.querySelector('#show-site');
const episodesStatusEl = document.querySelector('#episodes-status');
const episodesListEl = document.querySelector('#episodes-list');

// --- OMDb fallback ---
async function getShowFromOMDb(title) {
  const apiKey = "TU_API_KEY"; // pon tu API key de omdbapi.com
  if (!apiKey || !title) return null;
  const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.Response === "True" ? data : null;
}

function renderShow(data) {
  const name = data.name || data.Title || "Título no disponible";
  titleEl.textContent = name;

  const imgUrl = data.image?.medium || data.image?.original || data.Poster;
  imageEl.innerHTML =
    imgUrl && imgUrl !== "N/A"
      ? `<img src="${imgUrl}" alt="${name}" class="show-poster" />`
      : `<div class="no-image">Sin imagen</div>`;

  genresEl.textContent = (Array.isArray(data.genres) && data.genres.length)
    ? data.genres.join(" · ")
    : data.Genre || "Sin géneros";

  summaryEl.innerHTML = data.summary || data.Plot || "Sin descripción disponible";

  if (data.officialSite) {
    siteEl.href = data.officialSite;
    siteEl.hidden = false;
  } else {
    siteEl.hidden = true;
  }
}

async function searchByTitle(q) {
  const results = await getShowsByQuery(q);
  if (!results?.length) throw new Error("Sin resultados para el título");
  const exact = results.find(r => r.show?.name?.trim().toLowerCase() === q.trim().toLowerCase());
  return (exact ? exact.show : results[0].show);
}

async function loadShow() {
  try {
    // 1) Si hay ID válido, usamos TVMaze por ID
    if (id) {
      const tv = await getShowById(id);
      renderShow(tv);
      return tv.id; // para episodios
    }

    // 2) Sin ID → buscamos por título en TVMaze
    if (tParam) {
      try {
        const tvByTitle = await searchByTitle(tParam);
        renderShow(tvByTitle);
        return tvByTitle.id; // episodios si es serie
      } catch {
        // 3) Fallback a OMDb si TVMaze no encuentra
        const omdb = await getShowFromOMDb(tParam);
        if (omdb) {
          renderShow(omdb);
          return null; // OMDb no tiene episodios de TVMaze
        }
        // 4) Nada encontrado
        titleEl.textContent = "No se encontró el show.";
        imageEl.innerHTML = `<div class="no-image">Sin imagen</div>`;
        return null;
      }
    }

    // 5) Sin ID ni título
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
    const eps = await getEpisodesByShowId(showId);
    episodesStatusEl.textContent = "";

    if (!Array.isArray(eps) || !eps.length) {
      episodesListEl.innerHTML = '<li class="muted">No hay episodios disponibles.</li>';
      return;
    }

    episodesListEl.innerHTML = eps.map(ep => `
      <li>
        <strong>T${ep.season} · E${ep.number}:</strong> ${ep.name}
        ${ep.airdate ? `<span class="muted"> (${ep.airdate})</span>` : ""}
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
