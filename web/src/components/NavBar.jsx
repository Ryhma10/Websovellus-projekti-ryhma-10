import { Link } from "react-router-dom"
import "./NavBar.css"
import logo from "../assets/MadMooseMoviesLogoImage.png"
import CreateAccountModal from "../screens/CreateAccountModal";
import React from "react";

function NavBar() {

    const [showModal, setShowModal] = React.useState(false);

    return (
        <>
        <nav className="nav">
            <ul>
            <li><img src={logo} alt="Mad Moose Movies Logo" className="logo" /></li>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/movies">Movies</Link></li>
            <li><Link to="/groups">Groups</Link></li>
            <li><Link to="/reviews">Reviews</Link></li>
                    <li className="create-account-link">
                        <a
                            href="#"
                            onClick={e => {
                                e.preventDefault();
                                setShowModal(true);
                            }}
                        >
                            Create account
                        </a>
                    </li>
            <li className="profile-link">
            <Link to="/profile">Profile</Link> </li>
            </ul>
        </nav>
                    {showModal && (
                <CreateAccountModal onClose={() => setShowModal(false)} />
            )}
        </>
    );
}

export default NavBar