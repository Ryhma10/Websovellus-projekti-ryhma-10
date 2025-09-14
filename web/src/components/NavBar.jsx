import { Link } from "react-router-dom"
import "./NavBar.css"
import logo from "../assets/MadMooseMoviesLogo2.png"
import tempLogo from "../assets/MadMooseMoviesLogo.png"

function NavBar() {
    return (
        <>
        <img src={tempLogo} alt="Temporary Logo" className="temp-logo"/>
        
        <nav className="nav">
            <ul>
            <img src={logo} alt="Mad Moose Movies Logo" className="logo" />
            <Link to="/">Home</Link>
            <Link to="/movies">Movies</Link>
            </ul>
        </nav>
        </>
    );
}

export default NavBar