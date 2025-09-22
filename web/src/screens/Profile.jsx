import React from "react";
import { useNavigate } from "react-router-dom";

function Profile({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/"); // vie etusivulle
  };

  return (
    <div>
      <h1>Welcome to your profile!</h1>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
}

export default Profile;
