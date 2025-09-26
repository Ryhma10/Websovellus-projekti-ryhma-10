import { useState, useEffect } from 'react';
import { getMoviesFromTmdb, getTheatresFromFinnkino } from '../components/api';
import './Home.css';
import SearchBar from '../components/SearchBar';
import TheatresNowCarousel from '../components/TheatresNowCarousel';

function Home() {
  return (
    <>
      <SearchBar />
      <TheatresNowCarousel />
    </>
  );
}

export default Home;