import { Link } from "react-router-dom";
import "./NavBar.css";
import logo from "../assets/MadMooseMoviesLogo2.png";
import tempLogo from "../assets/MadMooseMoviesLogo.png";
import SignIn from "../screens/SignIn.jsx";
import SignUp from "../screens/SignUp.jsx";
import { useState } from "react";

function NavBar({ isLoggedIn, setIsLoggedIn }) { // <- propit ylhäältä
  const [modalType, setModalType] = useState(null); // vain modalien hallintaan

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
            {isLoggedIn ? (
              <Link to="/profile">Profile</Link>
            ) : (
              <>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setModalType("signin");
                  }}
                >
                  Sign In
                </a>
                {modalType === "signin" && (
                  <SignIn
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    onSignUp={() => setModalType("signup")}
                    onLoginSuccess={() => {
                      setIsLoggedIn(true);  // päivitetään App.jsx:n tila
                      setModalType(null);
                    }}
                  />
                )}
                {modalType === "signup" && (
                  <SignUp
                    isOpen={true}
                    onClose={() => setModalType(null)}
                    onSignIn={() => setModalType("signin")}
                  />
                )}
              </>
            )}
          </li>
        </ul>
      </nav>
    </>
  );
}

export default NavBar;
