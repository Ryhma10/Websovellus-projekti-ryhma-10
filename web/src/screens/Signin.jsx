import React, { useState } from "react"
import './Modal.css'

function SignIn({ isOpen, onClose, onSignUp, onLoginSuccess }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

// Kirjautumisen käsittelijä
  const handleLogin = async (e) => {
    e.preventDefault(); // Estä lomakkeen oletuskäyttäytyminen
    setError("") // Tyhjennä vanha virhe ennen uutta kirjautumista
    try {
      // Lähetä kirjautumispyyntö backendiin
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/signin`, {
        method: "POST",
        headers: {"Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })

      let data = {} // Alusta data tyhjäksi objektiksi
      if (response.headers.get("content-type")?.includes("application/json")) { 
        data = await response.json()
      } // Varmista, että yrittää jsonin parsimista vain jos vastaus on JSON

      if(response.ok && data.token) { // Tarkista, että vastaus on ok ja token olemassa
        localStorage.setItem("token", data.token) // Tallenna token LocalStorageen
        localStorage.setItem("username", data.username || username) // Tallenna käyttäjänimi LocalStorageen
        localStorage.setItem("userId", data.id) // Tallenna käyttäjän ID LocalStorageen
        onClose();
        if(onLoginSuccess) onLoginSuccess(data) // Kutsu onLoginSuccess callbackia, jos se on määritelty
      } else { 
        setError(data?.error || data?.message || "Invalid username or password") // Näytä palvelimen virheviesti
      }
    } catch (error) { // Käsittele verkko- tai muita virheitä
      setError("Error connecting to server"); // Näytä yleinen virheviesti
    }
  }

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal signin-modal">
        <h2>Sign in</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => {setUsername(e.target.value); if (error) setError(""); }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => { setPassword(e.target.value); if (error) setError(""); }}
          />
          <button type="submit" className="login-btn">Login</button>
        </form>
        <button onClick={onClose} className="close-btn">X</button>

        {error && <div className="error-message" role="alert" aria-live="assertive">{error}</div>}

        <p>Don't have an account? <a href="#" onClick={e => { e.preventDefault(); onSignUp(); }}>Sign up</a></p>
      </div>
    </div>
  )
}

export default SignIn
