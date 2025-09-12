import './App.css'
import { Routes, Route } from 'react-router-dom'
import NavBar from '../components/navBar'
import Movies from "./Movies"
import Home from './Home';
import SearchBar from '../components/SearchBar';

function App() {

  return (
    <>
      <div>
        <div className='topnav'>
        <NavBar />
        <SearchBar />
        </div>
        <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/movies" element={<Movies />}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App
