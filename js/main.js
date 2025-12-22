import { getShowsByQuery, getShowById } from './api.js';

const statusEl = document.querySelector('#status');
const resultsEl = document.querySelector('#results');
const topMoviesEl = document.querySelector('#top-movies');
const topSeriesEl = document.querySelector('#top-series');
const recommendationsEl = document.querySelector('#recommendations');
const searchSection = document.querySelector('.search-section');

function renderCards(container, items) {
  container.innerHTML = items.map(item => {
    const title = item.title || item.name || "Sin título";
    const id = item.id;
    const type = item.media_type || (item.first_air_date ? "tv" : "movie");
    const imgUrl = item.poster_path 
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
      : "assets/img/fallback.jpg";
    const t = encodeURIComponent(title);

    return `
      <a href="show.html?id=${id}&type=${type}&t=${t}" class="card" title="${title}">
        <img src="${imgUrl}" alt="${title}">
        <h3>${title}</h3>
      </a>
    `;
  }).join('');
}

// --- Arrays locales (manteniendo tu catálogo) ---
const topMovies = [
  { title: "Harry Potter", poster_path: "/wuMc08IPKEatf9rnMNXvIDxqP4W.jpg", id: 671, media_type: "movie" },
  { title: "Avatar", poster_path: "/kyeqWdyUXW608qlYkRqosgbbJyK.jpg", id: 19995, media_type: "movie" },
  { title: "Inception", poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", id: 27205, media_type: "movie" },
  { title: "The Invisible Man", poster_path: "/uZMZyvarQuXLRqf3xdpdMqzdtjb.jpg", id: 570670, media_type: "movie" },
  { title: "Annabelle Creation", poster_path: "/tb86j8jVCVsdZnzf8I6cIi65Nl.jpg", id: 396422, media_type: "movie" },
  { title: "Burlesque", poster_path: "/lXzYdM2rYzWxZmf0RduCMsZ0zQF.jpg", id: 39427, media_type: "movie" },
  { title: "To All The Boys I've Loved Before", poster_path: "/hKHZhUbIyUAjcSrqJThFGYIR6kI.jpg", id: 466282, media_type: "movie" },
  { title: "Anyone But You", poster_path: "/yRt7MGBSdpQkdcbYlX7HXqY0Y6Z.jpg", id: 1072790, media_type: "movie" },
  { title: "Safe Haven", poster_path: "/j6vZrj3ZzY0f7vJk9g6r5z7kC3F.jpg", id: 109431, media_type: "movie" },
  { title: "Bridge to Terabithia", poster_path: "/vOipe2myV5KH5xVmxXx9Yv5fFWM.jpg", id: 1267, media_type: "movie" },
  { title: "The Parent Trap", poster_path: "/sXkJ9xZq9VHtV6nRvWmvMRGsiE9.jpg", id: 10948, media_type: "movie" },
  { title: "How To Train Your Dragon", poster_path: "/o7dcZfFzFvYyqS2rYjZg0ZpQfM.jpg", id: 10191, media_type: "movie" },
  { title: "Despicable Me", poster_path: "/s7tUQ0nU6pFZzQ0jrISFRCGDpa2.jpg", id: 20352, media_type: "movie" },
  { title: "Lilo & Stitch", poster_path: "/zY5xZQ2E1VlzDqgW8sELpAo7P5u.jpg", id: 11544, media_type: "movie" }
];

const topSeries = [
  { id: 46733, name: "Sweet Tooth", poster_path: "/uJ0J0qQQuIIR2Y3r1YjDqf1XlSH.jpg", media_type: "tv" },
  { id: 58151, name: "¿Quién Mató A Sara?", poster_path: "/qJxzjUjCpTPvDHldNnlbRC4OqEh.jpg", media_type: "tv" },
  { id: 36732, name: "911 Lone Star", poster_path: "/j5y9p8vZpYfZcFz6P7k6A9kZZg6.jpg", media_type: "tv" },
  { id: 60336, name: "The Diplomat", poster_path: "/aZqK7lidhMlNROvQzQ9h9t7VDaR.jpg", media_type: "tv" },
  { id: 60337, name: "The Lincoln Lawyer", poster_path: "/vZpQfM9vDOMkMt2rt7NmBGG99nm.jpg", media_type: "tv" },
  { id: 365, name: "JAG", poster_path: "/dZQzQpimeISFRCGDpa2.jpg", media_type: "tv" },
  { id: 3650, name: "Ghost Whisperer", poster_path: "/nZpQfM9vDOMkMt2rt7NmBGG99nm.jpg", media_type: "tv" },
  { id: 677, name: "Charmed", poster_path: "/o7dcZfFzFvYyqS2rYjZg0ZpQfM.jpg", media_type: "tv" },
  { id: 36710, name: "Shadowhunters", poster_path: "/s7tUQ0nU6pFZzQ0jrISFRCGDpa2.jpg", media_type: "tv" },
  { id: 49813, name: "Fate The Winx Saga", poster_path: "/zY5xZQ2E1VlzDqgW8sELpAo7P5u.jpg", media_type: "tv" },
  { id: 49814, name: "Emily in Paris", poster_path: "/uJ0J0qQQuIIR2Y3r1YjDqf1XlSH.jpg", media_type: "tv" },
  { id: 49815, name: "Virgin River", poster_path: "/qJxzjUjCpTPvDHldNnlbRC4OqEh.jpg", media_type: "tv" },
  { id: 49816, name: "The Good Witch", poster_path: "/j5y9p8vZpYfZcFz6P7k6A9kZZg6.jpg", media_type: "tv" },
  { id: 49817, name: "Life In Color With David Attenborough", poster_path: "/aZqK7lidhMlNROvQzQ9h9t7VDaR.jpg", media_type: "tv" },
  { id: 49818, name: "The Haunting Of Hill House", poster_path: "/vZpQfM9vDOMkMt2rt7NmBGG99nm.jpg", media_type: "tv" }
];

const recommendations = [
  { title: "Wonka", poster_path: "/qJxzjUjCpTPvDHldNnlbRC4OqEh.jpg", id: 787699, media_type: "movie" },
  { title: "Dune: Part Two", poster_path: "/uJ0J0qQQuIIR2Y3r1YjDqf1XlSH.jpg", id: 693134, media_type: "movie" },
  { title: "Oppenheimer", poster_path: "/s7tUQ0nU6pFZzQ0jrISFRCGDpa2.jpg", id: 872585, media_type: "movie" },
  { title: "Holiday", poster_path: "/zY5xZQ2E1VlzDqgW8sELpAo7P5u.jpg", id: 109431, media_type: "movie" },
  { title: "Klaus", poster_path: "/o7dcZfFzFvYyqS2rYjZg0ZpQfM.jpg", id: 508965, media_type: "movie" }
];

// --- Inicio ---
function loadInitialSections() {
  renderCards(topMoviesEl, topMovies);
  renderCards(topSeriesEl, topSeries);
  renderCards(recommendationsEl, recommendations);
  resultsEl.innerHTML = '';
  statusEl.textContent = '';

  topMoviesEl.closest('section').style.display = "block";
  topSeriesEl.closest('section').style.display = "block";
  recommendationsEl.closest('section').style.display = "block";
  searchSection.style.display = "none";
}

// --- Buscar ---
document.querySelector('#nav-search')?.addEventListener('click', async (e) => {
  e.preventDefault();
  const q = prompt('Buscar (película, serie, deporte)…');
  if (!q) return;
  statusEl.textContent = `Buscando “${q}”…`;

  try {
    const data = await getShowsByQuery(q);
    topMoviesEl.closest('section').style.display = "none";
    topSeriesEl.closest('section').style.display = "none";
    recommendationsEl.closest('section').style.display = "none";
    searchSection.style.display = "block";
    searchSection.querySelector('h2').textContent = "Resultados";

    resultsEl.innerHTML = '';
    renderCards(resultsEl, data.slice(0, 12));
    statusEl.textContent = '';
  } catch (err) {
    console.error(err);
    statusEl.textContent = 'Error en la búsqueda.';
  }
});

// --- Navegación categorías ---
function showCategory(title, query) {
  topMoviesEl.closest('section').style.display = "none";
  topSeriesEl.closest('section').style.display = "none";
  recommendationsEl.closest('section').style.display = "none";
  searchSection.style.display = "block";
  searchSection.querySelector('h2').textContent = title;

  statusEl.textContent = `Cargando ${title.toLowerCase()}…`;
  getShowsByQuery(query).then(data => {
    resultsEl.innerHTML = '';
    renderCards(resultsEl, data.slice(0, 12));
    statusEl.textContent = '';
  }).catch(err => {
    console.error(err);
    statusEl.textContent = 'Error al cargar resultados.';
  });
}

document.querySelector('#nav-home')?.addEventListener('click', (e) => {
  e.preventDefault();
  loadInitialSections();
});
document.querySelector('#nav-movies')?.addEventListener('click', (e) => {
  e.preventDefault();
  showCategory("Películas", "movie");
});
document.querySelector('#nav-series')?.addEventListener('click', (e) => {
  e.preventDefault();
  showCategory("Series TV", "tv");
});
document.querySelector('#nav-sports')?.addEventListener('click', (e) => {
  e.preventDefault();
  showCategory("Deportes", "sport");
});
document.querySelector('#nav-live')?.addEventListener('click', (e) => {
  e.preventDefault();
  showCategory("TV en directo", "news");
});

// --- Inicial ---
loadInitialSections();
