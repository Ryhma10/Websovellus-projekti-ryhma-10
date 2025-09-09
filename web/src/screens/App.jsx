import { useState, useEffect } from 'react'
import './App.css'
import { getTheatresFromFinnkino } from '../components/api'

function App() {
  const [areas, setAreas] = useState([])
  useEffect(() => {
    const areas = getTheatresFromFinnkino()
    setAreas(areas)
  }, [])

  return (
    <>
      <h1>APP</h1>
          <p>This is Finnkino data</p>
      <div>
        <select>
          {
            areas.map(area => (
              <option key={area.id} value={area.id}>{area.area}</option>
            ))
          }
        </select>
      </div>
    </>
  )
}

export default App
