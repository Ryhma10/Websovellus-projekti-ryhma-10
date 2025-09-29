import './App.css';
import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';

import NavBar from '../components/NavBar';
import Movies from "./Movies";
import Groups from './Groups';
import Favorites from './Favorites';
import Home from './Home';
import Profile from './Profile';
import PublicFavorites from './PublicFavorites';

function App() {
  // Kirjautumistila App-tasolla, jotta NavBar ja Profile saavat saman tilan
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      <div>
        {/* NavBar näkyy kaikilla sivuilla */}
        <div className='topnav'>
          <NavBar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
        </div>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/favorites" element={<Favorites />} />
          {/* Profile saa setIsLoggedIn propin, jotta logout toimii */}
          <Route path="/profile" element={<Profile setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/public/:userId" element={<PublicFavorites />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
