import 'dotenv/config'

const getMoviesFromTmdb = async (query, page) => {
    try {
        const url = 'https://api.themoviedb.org/3/search/movie?query=' + query + '&include_adult=false&language=en-US&page=' + page;
        console.log("getMoviesFromTmdb has been called", url)
        const apiKey = process.env.API_KEY
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' + process.env.API_KEY,
                'accept' : 'application/json'
            }
        })
        const json = await response.json()
        console.log("Response from TMDB: \n", json)
        return json

    } catch (error) {
        console.error("Error in fetching TMDB API data. Error: ", error.message);
    }
}

const getGenresFromTmdb = async () => {
  const response = await fetch("https://api.themoviedb.org/3/genre/movie/list?language=en", {
    headers: {
      Authorization: 'Bearer ' + process.env.API_KEY,
      accept: "application/json"
    }
  });
  const data = await response.json();
  return data.genres || [];
};

const getPopularMoviesFromTmdb = async () => {
    const url = 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=1';
    const apiKey = process.env.API_KEY;
    const response = await fetch(url, {
        headers: {
            'Authorization': 'Bearer ' + apiKey,
            'accept': 'application/json'
        }
    });
    const data = await response.json();
    return data.results;
};

export { getMoviesFromTmdb, getGenresFromTmdb, getPopularMoviesFromTmdb }