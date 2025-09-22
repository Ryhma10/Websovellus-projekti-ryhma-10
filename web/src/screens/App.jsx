import './App.css'
import { Routes, Route } from 'react-router-dom'
import NavBar from '../components/NavBar'
import Movies from "./Movies"
import Groups from './Groups'
import Reviews from './Reviews'
import Profile from './Signin'
import Home from './Home';

function App() {

  return (
    <>
      <div>
        <div className='topnav'>
        <NavBar />
        </div>
        <Routes>
            <Route path="/" element={<Home />}></Route>
            <Route path="/movies" element={<Movies />}></Route>
            <Route path="/groups" element={<Groups />} />
            <Route path='/reviews' element={<Reviews />} />
            <Route path='/profile' element={<Profile />} />
        </Routes>
      </div>
    </>
  )
}

export default App
