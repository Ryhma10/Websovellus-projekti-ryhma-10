import React, { useState, useEffect } from "react";
import SignIn from "./Signin.jsx";
import GroupModal from "./GroupModal";
import "./Groups.css";
import { Link } from "react-router-dom";

function Groups() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const token = localStorage.getItem("token");

  // 🔸 Haetaan omat ryhmät
  useEffect(() => {
    const fetchMyGroups = async () => {
      if (!token) return;
      try {
        const res = await fetch("http://localhost:3001/api/groups/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Virhe haettaessa omia ryhmiä");
        const data = await res.json();
        setMyGroups(data);
      } catch (err) {
        console.error("Error fetching my groups:", err);
      }
    };
    fetchMyGroups();
  }, [token, myGroups]);

  // 🔸 Haetaan kaikki ryhmät
  useEffect(() => {
    const fetchAllGroups = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/groups", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Virhe haettaessa ryhmiä");
        const data = await res.json();
        setAllGroups(data);
      } catch (err) {
        console.error("Error fetching all groups:", err);
      }
    };
    fetchAllGroups();
  }, [token, allGroups]);

  // 🔸 Luo ryhmä -napin toiminto
  const handleCreateGroupClick = () => {
    if (!token) {
      setShowSignInModal(true);
    } else {
      setIsModalOpen(true);
    }
  };

  // 🔸 Lähetä liittymispyyntö
  const handleJoinRequest = async (groupId) => {
    if (!token) {
      alert("Sinun täytyy kirjautua sisään tai luoda käyttäjä liittyäksesi ryhmään.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/api/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId }),
      });

      const msg = await res.json();

      if (!res.ok) {
        throw new Error(msg.error || "Liittymispyyntö epäonnistui");
      }

      alert(msg.message);
      // Päivitetään omat ryhmät, jotta status näkyy heti
      setMyGroups((prev) => [...prev, { id: groupId, status: "pending" }]);
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // 🆕 Hyväksy liittymispyyntö
  const handleApprove = async (groupId, memberId) => {
    try {
      const res = await fetch("http://localhost:3001/api/groups/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ groupId, memberId }),
      });

      const msg = await res.json();
      if (!res.ok) throw new Error(msg.error || "Hyväksyntä epäonnistui");

      alert("Member approved!");
      // Poistetaan hyväksytty pyyntö listasta
      setPendingRequests((prev) =>
        prev.filter((r) => !(r.group_id === groupId && r.user_id === memberId))
      );
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // Tarkistetaan onko ryhmässä jo jäsenyyttä (ja mikä status)
  const getMembershipStatus = (groupId) => {
    const membership = myGroups.find((g) => g.id === groupId);
    return membership ? membership.status : null;
  };

  // 🔸 Näytetään kirjautumisikkuna jos ei ole tokenia
  if (showSignInModal) {
    return (
      <SignIn
        isOpen={true}
        onClose={() => setShowSignInModal(false)}
        onLoginSuccess={() => {
          setShowSignInModal(false);
          window.location.reload();
        }}
      />
    );
  }

  return (
    <div className="groups-container">
      <h1>Groups</h1>
      <button onClick={handleCreateGroupClick}>Create Group</button>
      <GroupModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="groups-lists-row">
        {token && (
          <div className="my-groups-list">
            <h2>My Groups</h2>
            <ul>
            <li className="groups-invidual-group-li">
              <p>Group name</p>
              Role (Status)
            </li>
              {myGroups.map((g) => (
                <li className="groups-invidual-group-li" key={g.id}>
                  <Link className="groups-link" to={`/groups/${g.id}`}>{g.name}</Link>
                  {g.role} ({g.status})
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="all-groups-list">
          <h2>All Groups</h2>
          <ul>
          <li className="groups-invidual-group-li">
              <p>Group name</p>
              Status
            </li>
            {allGroups.map((g) => {
              const status = getMembershipStatus(g.id);
              return (
                <li className="groups-invidual-group-li groups-all-groups-li" key={g.id}>
                  <p>{g.name}</p>
                  {status === "approved" && <span>✅ Joined</span>}
                  {status === "pending" && <span>⏳ Pending</span>}
                  {!status && (
                    <button onClick={() => handleJoinRequest(g.id)}>Join</button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Groups;
