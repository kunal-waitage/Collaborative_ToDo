"use client";
import { useState, useEffect } from "react";
import { auth, db, ref, onValue, update, remove, set } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar";

export default function InvitesPage() {
  const [invites, setInvites] = useState([]);
  const [currentUID, setCurrentUID] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUID(user.uid);
        import("firebase/database").then(({ get }) => {
          get(ref(db, "users/" + user.uid)).then((snap) => {
            if (snap.val()) setUsername(snap.val().username);
          });
        });
        onValue(ref(db, "invites/" + user.uid), (snapshot) => {
          const data = snapshot.val();
          if (!data) {
            setInvites([]);
            return;
          }
          const list = Object.entries(data)
            .filter(([, inv]) => inv.status === "pending")
            .map(([id, inv]) => ({ id, ...inv }));
          setInvites(list);
        });
      } else {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleAccept(invite) {
    await set(ref(db, `rooms/${invite.roomId}/members/${currentUID}`), true);
    await remove(ref(db, `invites/${currentUID}/${invite.id}`));
    window.location.href = `/room/${invite.roomId}`;
  }

  async function handleDecline(invite) {
    await remove(ref(db, `invites/${currentUID}/${invite.id}`));
  }

  return (
    <>
      <Navbar currentUID={currentUID} username={username} />
      <div
        style={{ maxWidth: "620px", margin: "40px auto", padding: "0 20px" }}
      >
        <h2
          style={{ color: "#0a1628", marginBottom: "24px", fontSize: "22px" }}
        >
          Invites
        </h2>
        {invites.length === 0 && (
          <p style={{ color: "#7a9cc0" }}>No pending invites</p>
        )}
        {invites.map((invite) => (
          <div
            key={invite.id}
            className="list-cont"
            style={{ height: "auto", padding: "16px" }}
          >
            <div style={{ flex: 1 }}>
              <p style={{ color: "#0a1628", fontWeight: "500" }}>
                {invite.roomName}
              </p>
              <p style={{ color: "#7a9cc0", fontSize: "13px" }}>
                from @{invite.fromUsername}
              </p>
            </div>
            <button
              onClick={() => handleAccept(invite)}
              className="addBtn"
              style={{ marginRight: "8px" }}
            >
              Accept
            </button>
            <button
              onClick={() => handleDecline(invite)}
              className="alert-cancel"
            >
              Decline
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
