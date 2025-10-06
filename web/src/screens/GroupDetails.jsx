import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./GroupDetails.css";

const handleAcceptRequest = async (userId) => {
  const token = localStorage.getItem("token");
  try {
    const response = await fetch("http://localhost:3001/api/groups/approve", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ groupId: id, memberId: userId }),
    });

    if (!response.ok) {
      throw new Error("Failed to approve membership");
    }

    const data = await response.json();
    console.log("Membership approved:", data);
    // Päivitä tila tai hae jäsenet uudelleen tarvittaessa
  } catch (error) {
    console.error("Error approving membership:", error);
  }
}

function GroupDetails() {
  const { id } = useParams(); // Get the group ID from the URL
  const [group, setGroup] = useState(null);
  const [pendingInvites, setPendingInvites] = useState([]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3001/api/groups/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched group details:", data);
        setGroup(data.groupDetails || []);
        setPendingInvites(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupDetails();
  }, [id]);

  console.log("Pending invites:", pendingInvites);

  return (
    <div className="groupDetails-container">
      <h2 className="groupDetails-h2">Pending Invites</h2>
      <ul className="groupDetails-ul">
        {pendingInvites.length > 0 ? (
          pendingInvites.map((invite) => (
            <li key={invite.user_id}>
              User ID: {invite.user_id}
              <button onClick={() => handleAcceptRequest(invite.user_id)}>
                Accept
              </button>
            </li>
          ))
        ) : (
          <li>No pending invites.</li>
        )}
      </ul>
    </div>
  );
}

export default GroupDetails;