import React from "react";
import { useNavigate } from "react-router-dom";

function Profile({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username")

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username")
    setIsLoggedIn(false);
    navigate("/"); // vie etusivulle
  };

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}

export default Profile;
