"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import Sidebar from "./Sidebar";

export default function Navbar({ currentUID, username }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await signOut(auth);
    window.location.href = "/login";
  }

  return (
    <>
      <nav>
        <div className="mynav">
          <button className="menubtn" onClick={() => setSidebarOpen(true)}>
            <i className="fa-solid fa-bars menuicon"></i>
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
