
const getTheatresFromFinnkino = async () => {
    const url = 'https://www.finnkino.fi/xml/TheatreAreas/';
    const apiData = await getFinnkinoApiData(url);
    const tempTheaters = [];
    const theatres = apiData[0].children;
    for (let i = 0; i < theatres.length; i++) {
        tempTheaters.push({
            id: theatres[i].children[0].innerHTML,
            area: theatres[i].children[1].innerHTML
        });
    }
    return tempTheaters; // still a Promise
};

const getDatesFromFinnkino = async () => {
    const url = 'https://www.finnkino.fi/xml/Schedule/';
    const apiData = await getFinnkinoApiData(url);
    const tempDates = [];
    const shows = apiData[0].getElementsByTagName('Show'); // haetaan suoraan kaikki Show-nodet
    for (let i = 0; i < shows.length; i++) {
        const s = shows[i];
        tempDates.push({
            title: s.getElementsByTagName('Title')[0]?.textContent,
            start: s.getElementsByTagName('dttmShowStart')[0]?.textContent,
            theatre: s.getElementsByTagName('Theatre')[0]?.textContent,
            eventID: s.getElementsByTagName('EventID')[0]?.textContent
        });
    }
    return tempDates;
}



const getFinnkinoApiData = async (url) => {
    try {
        const response = await fetch(url);
        const xml = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "application/xml");
        const apiData = xmlDoc.children;
        return apiData;
    } catch (error) {
        console.error("Error in fetching Finnkino API data. Error: ", error.message);
    }
}

const getMoviesFromTmdb = async () => {
    try {
        const url = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc'
        console.log("getMoviesFromTmdb has been called", url)
        const apiKey = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMmE3MmUwNmVhY2Y0YjE2MjM5NjAyYjAxMGZmMzVlNiIsIm5iZiI6MTc1NzQxMjYwMS4yMzEsInN1YiI6IjY4YmZmY2Y5NDIzMmZiZmNkNzRlNjUyMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._NLY9FA8xhchoIcTLhMG2RFNFWrx4K8lbVJ5q7tQEjg'
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization' : 'Bearer ' + apiKey,
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

// const getTmdbApiData = async () => {

//     const response = await fetch(process.env.VITE_TMDB_URL, {
//         headers: {
//             'Authorization' : 'Bearer ' + process.env.VITE_TMDB_API_KEY,
//             'accept' : 'application/json'
//         }
//     })

    
    
   /* curl --request GET \
     --url 'https://api.themoviedb.org/3/search/movie?include_adult=false&language=en-US&page=1' \
     --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkMmE3MmUwNmVhY2Y0YjE2MjM5NjAyYjAxMGZmMzVlNiIsIm5iZiI6MTc1NzQxMjYwMS4yMzEsInN1YiI6IjY4YmZmY2Y5NDIzMmZiZmNkNzRlNjUyMSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ._NLY9FA8xhchoIcTLhMG2RFNFWrx4K8lbVJ5q7tQEjg' \
     --header 'accept: application/json'*/

export { getTheatresFromFinnkino, getMoviesFromTmdb, getDatesFromFinnkino }

// import { useState, useEffect } from 'react'
// import './App.css'
// import ReactPaginate from 'react-paginate'

// function App() {

//   const [movies, setMovies] = useState([]) //tehdään tilamuuttuja array, johon tulee elokuvat. Kun tila päivittyy, näytetään elokuvat
//   const [page, setPage] = useState(1)
//   const [pageCount, setPageCount] = useState(0)
//   const [query, setQuery] = useState()

//   const Movies = () => {                   // (<> printtaa jotain näkyviin) Luupataan leffat läpi, muista laittaa riveille omat keyt!
//     return (
//       <table>                                   
//         {
//           movies && movies.map(movie => (
//             <tr key={movie.id}><td>{movie.title}</td></tr>
//         ))}
//       </table>
//     )
//   }

//   //tehdään funktio search toimintoa varten
//   const search = () => {
//         fetch('https://api.themoviedb.org/3/search/movie?query=' + query + '&include_adult=false&language=en-US&page=' + page, {
//       headers: {
//         'Authorization': 'Bearer blaablaablaa',
//         'Content-Type': 'application/json'
//       }
//     }).then(response => response.json()) //käsitellään vastaus (response) serveriltä
//     .then(json => {
//       //console.log(json)
//       setMovies(json.results)           //elokuvan data sijaitsee results nodessa
//       setPageCount(json.total_pages)
//     })
//     .catch(error => {
//       console.log(error)
//     })
//   }

//   useEffect(() => {                     //haetaan data apilta
//     search()
//   }, [page])                            //lataa uudestaan aina kun page tilamuuttujan tila muuttuu
  
//   return (
//     <div id="container">
//       <h3>Search movies</h3>
//       <input value={query} onChange={e => setQuery(e.target.value)}></input><button onClick={search} type="button">Search</button>
//       <ReactPaginate 
//         breakLabel="..."
//         nextLabel=">"
//         onPageChange={(e) => setPage(e.selected + 1)} //alkuarvo 0, joten lisättävä ykkönen, määritellään sivunvaihto päivittämättä tilamuuttuja
//         pageRandgeDisplayed={5}
//         pageCount={pageCount}
//         previousLabel="<"
//         renderOnZeroPageCount={null}
//       />
//       <Movies />
//     </div>
//   )
// }

// export default App
