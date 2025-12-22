import { getShowsByQuery } from './api.js';

const statusEl = document.querySelector('#status');
const resultsEl = document.querySelector('#results');
const topMoviesEl = document.querySelector('#top-movies');
const topSeriesEl = document.querySelector('#top-series');
const recommendationsEl = document.querySelector('#recommendations');
const searchSection = document.querySelector('.search-section');

function renderCards(container, items) {
  container.innerHTML = items.map(item => {
    const show = item.show || item;
    const title = show.name || show.title || "Sin título";
    const id = show.id;
    const imgUrl = show.image?.medium || show.image?.original || show.image || "assets/img/fallback.jpg";
    const t = encodeURIComponent(title);

    // Si el ID es válido, usamos show.html?id=...; si no, solo show.html?t=...
    const hasValidId = Number.isInteger(Number(id)) && Number(id) > 0;
    const href = hasValidId ? `show.html?id=${id}&t=${t}` : `show.html?t=${t}`;

    return `
      <a href="${href}" class="card" title="${title}">
        <img src="${imgUrl}" alt="${title}">
        <h3>${title}</h3>
      </a>
    `;
  }).join('');
}

// --- Arrays híbridos (todo tu catálogo intacto) ---
const topMovies = [
  { id: 68803, title: "Harry Potter", image: "assets/img/HARRY.jpg" },
  { title: "Avatar", image: "assets/img/AVATAR.webp" },
  { title: "Inception", image: "assets/img/INCEPTION.avif" },
  { title: "The Da Vinci Code", image: "assets/img/CODE.webp" },
  { title: "The Invisible Man", image: "assets/img/INVISIBLE.webp" },
  { title: "Annabelle Creation", image: "assets/img/ANABELLE.webp" },
  { title: "Burlesque", image: "assets/img/BURLESQUE.jpg" },
  { title: "To All The Boys I've Loved Before", image: "assets/img/TOALL.jpg" },
  { title: "Anyone But You", image: "assets/img/ANYONE.webp" },
  { title: "Safe Haven", image: "assets/img/SAFE.avif" },
  { title: "A Bridge To Terabithia", image: "assets/img/TARA.jpg" },
  { title: "The Parent Trap", image: "assets/img/PARENT.jpg" },
  { title: "How To Train Your Dragon", image: "assets/img/DRAGON.webp" },
  { title: "Despicable Me Collection", image: "assets/img/DESPICABLE.webp" },
  { title: "Lilo & Stitch", image: "assets/img/LILO.jpg" }
];

const topSeries = [
  { id: 46733, title: "Sweet Tooth", image: "assets/img/sweet-tooth.avif" },
  { id: 58151, title: "¿Quién Mató A Sara?", image: "assets/img/quienmato.webp" },
  { id: 36732, title: "911 Lone Star", image: "assets/img/911.jpg" },
  { id: 60336, title: "The Diplomat", image: "assets/img/the_diplomat.jpg" },
  { id: 60337, title: "The Lincoln Lawyer", image: "assets/img/lincoln.webp" },
  { id: 365, title: "JAG", image: "assets/img/jag.jpg" },
  { id: 3650, title: "Ghost Whisperer", image: "assets/img/ghost.webp" },
  { id: 677, title: "Charmed", image: "assets/img/charmed.jpg" },
  { id: 36710, title: "Shadowhunters", image: "assets/img/shadow.jpg" },
  { id: 49813, title: "Fate The Winx Saga", image: "assets/img/fate.avif" }, 
  { id: 49814, title: "Emily in Paris", image: "assets/img/emily.webp" },
  { id: 49815, title: "Virgin River", image: "assets/img/virgin.avif" },
  { id: 49816, title: "The Good Witch", image: "assets/img/good.jpg" },
  { id: 49817, title: "Life In Color With David Attenborough", image: "assets/img/lavida.jpg" },
  { id: 49818, title: "The Haunting Of Hill House", image: "assets/img/haunting.jpg" }
];

const recommendations = [
  { title: "Wonka", image: "assets/img/WONKA-POSTER-02.jpg" },
  { title: "Dune 2", image: "assets/img/dune.avif" },
  { title: "Oppenheimer", image: "assets/img/oppen.jpg" },
  { title: "Holiday", image: "assets/img/holiday.jpg" },
  { title: "Klaus", image: "assets/img/klaus.jpg" }
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
  showCategory("Películas", "film");
});
document.querySelector('#nav-series')?.addEventListener('click', (e) => {
  e.preventDefault();
  showCategory("Series TV", "series");
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
