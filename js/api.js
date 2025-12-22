// TVMaze API
const api = axios.create({
  baseURL: 'https://api.tvmaze.com',
  timeout: 8000
});

// Buscar shows por texto
export async function getShowsByQuery(query) {
  const { data } = await api.get(`/search/shows?q=${encodeURIComponent(query)}`);
  return data; // [{ score, show }]
}

// Obtener detalles por ID
export async function getShowById(id) {
  const { data } = await api.get(`/shows/${id}`);
  return data;
}

// Obtener episodios por show
export async function getEpisodesByShowId(id) {
  const { data } = await api.get(`/shows/${id}/episodes`);
  return data;
}
