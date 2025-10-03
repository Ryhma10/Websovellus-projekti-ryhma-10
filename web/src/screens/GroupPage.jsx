import React from "react";
import { useParams } from "react-router-dom";
 
function GroupPage() {
  const { groupId } = useParams();
  // Nyt voit hakea ryhmän tiedot groupId:n perusteella
  return (
    <div>
      <h2>Group {groupId}</h2>
      {/* Näytä ryhmän tiedot, liittymispyynnöt jne. */}
    </div>
  );
}
 
export default GroupPage;