import { useState, useEffect } from 'react';
import { getMoviesFromTmdb, getTheatresFromFinnkino } from '../components/api';
import './Home.css';
import SearchBar from '../components/SearchBar';

function Home() {
  return (
    <>
      <SearchBar />
    </>
  );
}

export default Home;