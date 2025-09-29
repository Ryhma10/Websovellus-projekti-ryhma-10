import React, { useState, useEffect } from "react";
import GroupModal from "./GroupModal";

function Groups() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  const token = localStorage.getItem("token");

  // Haetaan omat ryhmät
  useEffect(() => {
    fetch("http://localhost:3001/api/groups/my", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setMyGroups)
      .catch((err) => console.error("Error fetching my groups:", err));
  }, [token]);

  // Haetaan kaikki ryhmät
  useEffect(() => {
    fetch("http://localhost:3001/api/groups", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setAllGroups)
      .catch((err) => console.error("Error fetching all groups:", err));
  }, [token]);

  // Lähetä liittymispyyntö
  const handleJoinRequest = (groupId) => {
    fetch("http://localhost:3001/api/groups/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ groupId }),
    })
      .then((res) => res.json())
      .then((msg) => alert(msg.message))
      .catch((err) => console.error(err));
  };

  return (
    <div>
      <h1>Groups</h1>
      <button onClick={() => setIsModalOpen(true)}>Create Group</button>
      <GroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <h2>My Groups</h2>
      <ul>
        {myGroups.map((g) => (
          <li key={g.id}>
            <a href={`/groups/${g.id}`}>{g.name}</a>
          </li>
        ))}
      </ul>

      <h2>All Groups</h2>
      <ul>
        {allGroups.map((g) => (
          <li key={g.id}>
            {g.name}{" "}
            <button onClick={() => handleJoinRequest(g.id)}>Join</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Groups;
