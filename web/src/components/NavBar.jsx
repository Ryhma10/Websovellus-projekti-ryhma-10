import { Link } from "react-router-dom";
import "./NavBar.css";
import logo from "../assets/MadMooseMoviesLogo2.png";
import tempLogo from "../assets/MadMooseMoviesLogo.png";
import Profile from "../screens/Profile";
import { useState } from "react";

function NavBar() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <img src={tempLogo} alt="Temporary Logo" className="temp-logo" />
            <nav className="nav">
                <ul>
                    <li><img src={logo} alt="Mad Moose Movies Logo" className="logo" /></li>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/movies">All Movies</Link></li>
                    <li><Link to="/groups">Groups</Link></li>
                    <li><Link to="/reviews">Reviews</Link></li>
                    <li className="profile-link">
                        <a
                            href="#"
                            onClick={e => {
                                e.preventDefault();
                                setShowModal(true);
                            }}
                        >
                            Profile
                        </a>
                    </li>
                </ul>
            </nav>
            {/* Only render modal when showModal is true */}
            {showModal && (
                <Profile isOpen={showModal} onClose={() => setShowModal(false)} />
            )}

        </>
    );
}

export default NavBar;