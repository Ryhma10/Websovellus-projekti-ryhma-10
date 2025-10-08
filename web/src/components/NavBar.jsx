import { Link } from "react-router-dom";
import "./NavBar.css";
import logo from "../assets/MadMooseMoviesLogo2.png";
import tempLogo from "../assets/MadMooseMoviesLogo.png";
import SignIn from "../screens/Signin.jsx";
import SignUp from "../screens/SignUp.jsx";
import { useState, useEffect } from "react";

function NavBar({ isLoggedIn, setIsLoggedIn }) {
  const [modalType, setModalType] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Mobile menu handlers
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const closeSidebar = () => setMenuOpen(false);

  // On mount, check localStorage for token
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [setIsLoggedIn]);

  return (
    <>
      <img src={tempLogo} alt="Temporary Logo" className="temp-logo" />
      <nav className="nav">
        <img src={logo} alt="Mad Moose Movies Logo" className="logo" />

        {/* Mobile burger menu */}
        <div className="burger" onClick={toggleMenu}>
            <span></span>
            <span></span>
            <span></span>
          </div>

          {/* Desktop nav links */}
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/movies">All Movies</Link></li>
          <li><Link to="/groups">Groups</Link></li>
          <li><Link to="/favorites">Favorites</Link></li>
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
                    onLoginSuccess={(userData) => {
                      setIsLoggedIn(true);
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

        {/* Sidebar for mobile*/}
        <div className={`sidebar${menuOpen ? " open" : ""}`}>
          <ul className="mobile-nav">
            <li><Link to="/" onClick={closeSidebar} className="mobile-nav-link">Home</Link></li>
            <li><Link to="/movies" onClick={closeSidebar} className="mobile-nav-link">All Movies</Link></li>
            <li><Link to="/groups" onClick={closeSidebar} className="mobile-nav-link">Groups</Link></li>
            <li><Link to="/favorites" onClick={closeSidebar} className="mobile-nav-link">Favorites</Link></li>
            <li className="profile-link">
            {isLoggedIn ? (
              <Link to="/profile" onClick={closeSidebar} className="mobile-nav-link">Profile</Link>
            ) : (
              <a
                href="#"
                onClick={e => {
                  e.preventDefault();
                  setModalType("signin");
                  closeSidebar();
                }}
                className="mobile-nav-link"
              >
                Sign In
              </a>
            )}
          </li>
        </ul>
      </div>
      {/* Overlay to close sidebar */}
      {menuOpen && (
        <div 
        className="sidebar-overlay" 
        onClick={closeSidebar}
        />
      )}

      {/* Render modals OUTSIDE sidebar */}
      {modalType === "signin" && (
        <SignIn
          isOpen={true}
          onClose={() => setModalType(null)}
          onSignUp={() => setModalType("signup")}
          onLoginSuccess={userData => {
            setIsLoggedIn(true);
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
    </nav>
  </>
);
}

export default NavBar;
