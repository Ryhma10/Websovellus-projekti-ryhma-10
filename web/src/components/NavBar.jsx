import { Link } from "react-router-dom"
import "./NavBar.css"

function NavBar() {
    return (
        <>
        <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/movies">Movies</Link>
        </nav>
        </>
    );
}

export default NavBar