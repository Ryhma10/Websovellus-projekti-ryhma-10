import { useState, useEffect } from 'react';
import { getTheatresFromFinnkino, getMoviesFromTmdb, getDatesFromFinnkino } from './api';
import './SearchBar.css'


export default function SearchBar() {
  const [areas, setAreas] = useState([]);
  const [dates, setDates] = useState([]);

  useEffect(() => {
    const fetchDates = async () => {
      const datesData = await getDatesFromFinnkino();
      setDates(datesData);
    };
    const fetchAreas = async () => {
      const areasData = await getTheatresFromFinnkino();
      setAreas(areasData);
    };

    fetchAreas();
    fetchDates();
  }, []);

  return (
      <>
        <div className="searchbar">
          <h1>This is search bar</h1>
        <select className="theatres-dropdown">
          {areas.map(area => (
            <option key={area.id} value={area.id}>{area.area}</option>
          ))}
        </select>
      </div>
        
      </>
    )
  
}

