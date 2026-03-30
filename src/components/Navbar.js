"use client";
import { useState, useEffect } from "react";
import { auth, db, ref, onValue } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Sidebar from "./Sidebar";

export default function Navbar({ currentUID, username }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasNotification, setHasNotification] = useState(false);

  useEffect(() => {
    if (!currentUID) return;

    // Check pending invites
    const invitesRef = ref(db, "invites/" + currentUID);
    const unsubInvites = onValue(invitesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const pending = Object.values(data).some((i) => i.status === "pending");
        if (pending) {
          setHasNotification(true);
          return;
        }
      }

      // Check new tasks in rooms
      const roomsRef = ref(db, "rooms");
      onValue(roomsRef, (snap) => {
        const rooms = snap.val();
        if (!rooms) return;
        const myRooms = Object.entries(rooms).filter(
          ([, r]) => r.members && r.members[currentUID],
        );
        if (myRooms.length > 0) setHasNotification(true);
      });
    });

    return () => unsubInvites();
  }, [currentUID]);

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/login";
  }

  return (
    <>
      <nav>
        <div className="mynav">
          <button
            className="menubtn"
            onClick={() => {
              setSidebarOpen(true);
              setHasNotification(false);
            }}
          >
            <i className="fa-solid fa-bars menuicon"></i>
            {hasNotification && <span className="notif-badge"></span>}
          </button>
          <h3>Real-Time Collaborative ToDo App</h3>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </nav>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentUID={currentUID}
        username={username}
      />
    </>
  );
}
