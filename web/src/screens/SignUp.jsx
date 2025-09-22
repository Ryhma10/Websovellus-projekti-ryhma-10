import React, { useState } from "react";
import './Modal.css';

function SignUp({ isOpen, onClose, onSignIn }) {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:3001/api/users/signup", {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      if(response.ok) {
        onClose();
      } else {
        alert("Registration failed");
      }

    } catch (error) {
      alert("Error connecting to server");
    }
  }

    if (!isOpen) return null; // tämä estää koko komponenttia piirtymästä

    return (
    <div className="modal-backdrop">
      <div className="signup-modal">
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button type="submit" className="login-btn">Register</button>
        </form>
        <button onClick={onClose} className="close-btn">Close</button>

        <p>Already have an account? <a href="#" onClick={e => { e.preventDefault(); onSignIn(); }}>Sign in</a></p>
      </div>
    </div>
  );
}

export default SignUp;