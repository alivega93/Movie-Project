const BASE_URL = "/.netlify/functions/tmdb";

async function callTmdb(endpoint, params = {}) {
  const url = `${BASE_URL}?endpoint=${encodeURIComponent(
    endpoint
  )}&params=${encodeURIComponent(JSON.stringify(params))}`;

  const res = await fetch(url);
  if (!res.ok) {
    console.error("Error TMDb:", res.status, res.statusText);
    throw new Error("Error al llamar a TMDb");
  }

  return res.json();
}
export async function getShowsByQuery(query) {
  try {
    const data = await callTmdb("/search/multi", { query });
    return data.results || [];
  } catch (error) {
    console.error("Error buscando shows:", error);
    return [];
  }
}
export async function getShowById(id, type = "movie") {
  try {
    const data = await callTmdb(`/${type}/${id}`, {});
    return data;
  } catch (error) {
    console.error("Error obteniendo show:", error);
    return null;
  }
}
export async function getEpisodesByShowId(tvId, season = 1) {
  try {
    const data = await callTmdb(`/tv/${tvId}/season/${season}`, {});
    return data.episodes || [];
  } catch (error) {
    console.error("Error obteniendo episodios:", error);
    return [];
  }
}
export async function getTrendingDay() {
  try {
    const data = await callTmdb("/trending/all/day", {});
    return data.results || [];
  } catch (error) {
    console.error("Error obteniendo trending:", error);
    return [];
  }
}

export async function getTrendingWeek() {
  try {
    const data = await callTmdb("/trending/all/week", {});
    return data.results || [];
  } catch (error) {
    console.error("Error obteniendo trending semanal:", error);
    return [];
  }
}

export async function getGenres(type = "movie") {
  try {
    const data = await callTmdb(`/genre/${type}/list`, {});
    return data.genres || [];
  } catch (error) {
    console.error("Error obteniendo géneros:", error);
    return [];
  }
}
