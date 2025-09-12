import { Link } from "react-router-dom"
import "./NavBar.css"
import logo from "../assets/MadMooseMoviesLogoImage.png"

function NavBar() {
    return (
        <>
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