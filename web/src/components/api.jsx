
const getTheatresFromFinnkino = () => {
    const tempAreas = []
    fetch('https://www.finnkino.fi/xml/TheatreAreas/')
      .then(response => response.text())
      .then(xml => {
        const apiData = getFinnkinoApiData(xml)
        const theatres = apiData[0].children
        for (let i=0;i<theatres.length;i++) {
            tempAreas.push(
                {
                    "id": theatres[i].children[0].innerHTML,
                    "area": theatres[i].children[1].innerHTML
                }
            )
    }
      })
      .catch(error => {
        console.error("Error in fetching API data. Error: ", error.message)
      })
      
    return tempAreas
}

const getFinnkinoApiData = (xml) => {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xml, "application/xml")
    const apiData = xmlDoc.children
    return apiData
}

export {getTheatresFromFinnkino}