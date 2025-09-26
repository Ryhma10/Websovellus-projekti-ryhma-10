//Api-client
//Asynkroniset funktiot, joilla React-komponentit hakevat dataa Finnkinosta ja TMDB:stä.

const getTheatresFromFinnkino = async () => { //haetaan teatterialueet endpointista
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

const getDatesFromFinnkino = async (areaIds = []) => {
    let allDates = [];
    for (const areaId of areaIds) {
        const url = 'https://www.finnkino.fi/xml/Schedule/?area=' + areaId;
    const apiData = await getFinnkinoApiData(url);
    const shows = apiData[0].getElementsByTagName('Show'); // haetaan suoraan kaikki Show-nodet
    for (let i = 0; i < shows.length; i++) {
        const s = shows[i];
        allDates.push({
            title: s.getElementsByTagName('Title')[0]?.textContent,
            start: s.getElementsByTagName('dttmShowStart')[0]?.textContent,
            theatre: s.getElementsByTagName('Theatre')[0]?.textContent,
            eventID: s.getElementsByTagName('EventID')[0]?.textContent,
            image: s.getElementsByTagName('EventMediumImagePortrait')[0]?.textContent,
            theatreId: areaId
        });
    }
    }
    return allDates;
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


export { getTheatresFromFinnkino, getDatesFromFinnkino }
