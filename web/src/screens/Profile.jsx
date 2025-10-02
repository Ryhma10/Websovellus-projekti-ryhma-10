import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";

function Profile({ setIsLoggedIn, setUser }) {
  const navigate = useNavigate();
  const username = localStorage.getItem("username")
  const [selectedFile, setSelectedFile] = useState(null);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3001/api/users/profile-picture", {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        setProfilePicture(data.profilePictureUrl); // or data.profile_picture_url
      });
  }, []);

  // Profiilikuvan käsittely
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0])
  }

  //Profiilikuvan lähetys backendille
  const handleUpload = async () => {
    if (!selectedFile) return;
    const token = localStorage.getItem("token");
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      const response = await fetch("http://localhost:3001/api/users/profile-picture", {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ pictureUrl: base64String })
      });
      if (response.ok) {
        alert("Profile picture updated!");
        setProfilePicture(base64String);
      } else {
        alert("Failed to upload profile picture.");
      }
    };
    reader.readAsDataURL(selectedFile);
  };

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
        navigate("/"); // Vie kotisivulle
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
    <div className="profile-container">
      <h1 className="profile-header">Welcome, {username}!</h1>
      {profilePicture && (
        <img src={profilePicture ? profilePicture : "./assets/placeholder.png"} alt="Profile" className="profile-picture"/>
      )}
      <details className="change-picture-details">
        <summary>Change Profile Picture</summary>
        <input className="file-input" type="file" accept="image/*" onChange={handleFileChange} />
        <button className="upload-btn" onClick={handleUpload}>Upload Profile Picture</button>
      </details>
      <button className="log-out-btn" onClick={handleLogout}>Log Out</button>
      <button className="delete-account-btn" onClick={handleDeleteAccount}>Delete Account</button>
    </div>
  );

}


export default Profile;
