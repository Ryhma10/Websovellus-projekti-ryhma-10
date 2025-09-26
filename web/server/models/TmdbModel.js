const apiKey = process.env.TMDB_API_KEY;

export async function searchMovies(query, page = 1) {
    const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=${page}`;
    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'accept': 'application/json'
        }
    });
    if (!res.ok) throw new Error('TMDB fetch failed');
    return await res.json();
}

export async function getGenres() {
    const url = "https://api.themoviedb.org/3/genre/movie/list?language=en";
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'accept': 'application/json'
        }
    });
    if (!res.ok) throw new Error('TMDB fetch failed');
    const data = await res.json();
    return data.genres || [];
}

export async function getPopularMovies() {
    const url = 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1';
    const res = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'accept': 'application/json'
        }
    });
    if (!res.ok) throw new Error('TMDB fetch failed');
    const data = await res.json();
    return data.results;
}
