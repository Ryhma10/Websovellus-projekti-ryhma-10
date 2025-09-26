import fetch from "node-fetch";

// Movie by ID (esim. tmdb_id = 550 => Fight Club)
export async function getMovieByIdFromTmdb(id) {
  try {
    const url = `https://api.themoviedb.org/3/movie/${id}?language=en-US`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
        accept: "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`TMDB request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error("getMovieByIdFromTmdb error:", err.message);
    throw err;
  }
}
