import React, { useState } from "react"
import "./Modal.css"

function GroupModal({ isOpen, onClose }) {
  const [name, setName] = useState("")
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://localhost:3001/api/groups/create", {
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

      alert(`Group "${data.name}" created!`)
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
