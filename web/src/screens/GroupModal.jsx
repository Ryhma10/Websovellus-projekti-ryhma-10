import React, { useState } from "react"
import "./Modal.css"

function GroupModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState("")
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const token = localStorage.getItem("token")
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to create group")
        return;
      }

      onCreated?.(data)
      onClose()
    } catch (err) {
      setError("Server connection failed")
    }
  };

  if (!isOpen) return null

  return (
    <div className="modal-backdrop">
      <div className="modal modal--narrow">
        <button onClick={onClose} className="close-btn">X</button>
        <h2>Create Group</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button type="submit" className="login-btn">Create</button>
        </form>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  )
}

export default GroupModal
