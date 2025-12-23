exports.handler = async (event) => {
  try {
    const endpoint = event.queryStringParameters.endpoint;
    const paramsRaw = event.queryStringParameters.params || "{}";

    if (!endpoint) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing endpoint" }) };
    }

    const allowed =
      endpoint === "/trending/all/day" ||
      endpoint === "/trending/all/week" ||
      endpoint === "/search/multi" ||
      endpoint === "/genre/movie/list" ||
      endpoint === "/genre/tv/list" ||
      endpoint.startsWith("/movie/") ||
      endpoint.startsWith("/tv/");

    if (!allowed) {
      return { statusCode: 403, body: JSON.stringify({ error: "Endpoint not allowed" }) };
    }

    let params = {};
    try { params = JSON.parse(paramsRaw); } catch { params = {}; }

    const url = new URL("https://api.themoviedb.org/3" + endpoint);
    const finalParams = { language: "es-ES", ...params };

    Object.entries(finalParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_TOKEN}`,
        accept: "application/json",
      },
    });

    const body = await res.text();

    return {
      statusCode: res.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body,
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Server error", details: String(err) }) };
  }
};
