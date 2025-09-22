import React from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile({ setIsLoggedIn, setUser }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username")

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username")
    setIsLoggedIn(false);
    navigate("/"); // vie etusivulle
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You are not logged in. Please log in first.");
      navigate("/");
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/api/users/delete", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        if (setUser) setUser(null);
        if (setIsLoggedIn) setIsLoggedIn(false);
        navigate("/"); // Redirect to home
        alert("Account deleted.");
      } else if (response.status === 401) {
        alert("Unauthorized. Please log in again.");
        localStorage.removeItem("token");
        if (setUser) setUser(null);
        if (setIsLoggedIn) setIsLoggedIn(false);
        navigate("/");
      } else {
        alert("Failed to delete account.");
      }
    } catch (error) {
      alert("Error deleting account.");
    }
  };

  return (
    <div>
      <h1>Welcome, {username}!</h1>
      <button className="log-out-btn" onClick={handleLogout}>Log Out</button>
      <button className="delete-account-btn" onClick={handleDeleteAccount}>Delete Account</button>
    </div>
  );
}

export default Profile;
