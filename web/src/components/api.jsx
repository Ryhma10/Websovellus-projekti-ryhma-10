
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

const getFinnkinoApiData = async (url) => {
    try {
        const response = await fetch(url);
        const xml = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "application/xml");
        const apiData = xmlDoc.children;
        return apiData;
    } catch (error) {
        console.error("Error in fetching API data. Error: ", error.message);
    }
}

export { getTheatresFromFinnkino }