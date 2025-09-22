import React, { useState } from "react";
import './Modal.css';

function SignIn({ isOpen, onClose, onSignUp, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/users/signin", {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if(data.token) {
        localStorage.setItem("token", data.token);
        console.log("Login successful, token stored.");
        onClose();
        if(onLoginSuccess) onLoginSuccess();
      } else {
        alert("Login failed");
      }
    } catch (error) {
      alert("Error connecting to server");
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="signin-modal">
        <h2>Sign in</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="login-btn">Login</button>
        </form>
        <button onClick={onClose} className="close-btn">Close</button>

        <p>Don't have an account? <a href="#" onClick={e => { e.preventDefault(); onSignUp(); }}>Sign up</a></p>
      </div>
    </div>
  );
}

export default SignIn;
