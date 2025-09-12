import './App.css'
import { Routes, Route } from 'react-router-dom'
import NavBar from '../components/navBar'
import Movies from "./Movies"
import Home from './Home';

function App() {

  return (
    <>
      <div>
        <NavBar />
        <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/movies" element={<Movies />}></Route>
        </Routes>
      </div>
    </>
  )
}

export default App
