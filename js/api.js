import axios from "axios";

const API_URL = "https://api.themoviedb.org/3";
const TOKEN = "TU_TOKEN_DE_TMDB"; // reemplaza con tu token

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    accept: "application/json"
  },
  params: { language: "es-ES" }
});

// Buscar (películas, series, personas)
export async function getShowsByQuery(query) {
  const { data } = await api.get("/search/multi", { params: { query } });
  return data.results;
}

// Detalle de película o serie
export async function getShowById(id, type = "movie") {
  const { data } = await api.get(`/${type}/${id}`);
  return data;
}

// Episodios de temporada (solo series)
export async function getEpisodesByShowId(tvId, season = 1) {
  const { data } = await api.get(`/tv/${tvId}/season/${season}`);
  return data.episodes;
}

// Tendencias del día (opcional para home)
export async function getTrendingDay() {
  const { data } = await api.get("/trending/all/day");
  return data.results;
}
