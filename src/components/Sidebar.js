"use client";
import { useState, useEffect } from "react";
import { auth, db, ref, onValue } from "@/lib/firebase";
import Link from "next/link";

export default function Sidebar({ isOpen, onClose, currentUID, username }) {
  const [rooms, setRooms] = useState([]);
  const [inviteCount, setInviteCount] = useState(0);

  useEffect(() => {
    if (!currentUID) return;

    const roomsRef = ref(db, "rooms");
    onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) return;
      const myRooms = Object.entries(data)
        .filter(([, room]) => room.members && room.members[currentUID])
        .map(([id, room]) => ({ id, name: room.name }));
      setRooms(myRooms);
    });

    const invitesRef = ref(db, "invites/" + currentUID);
    onValue(invitesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setInviteCount(0);
        return;
      }
      const pending = Object.values(data).filter((i) => i.status === "pending");
      setInviteCount(pending.length);
    });
  }, [currentUID]);

  if (!isOpen) return null;

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose}></div>
      <div className="sidebar">
        <div className="sidebar-header">
          <h3>Menu</h3>
          <button onClick={onClose} className="sidebar-close">
            ✕
          </button>
        </div>

        <div className="sidebar-section">
          <Link href="/profile" onClick={onClose} className="sidebar-item">
            <i className="fa-solid fa-user"></i>
            <span>Profile</span>
            <small>@{username}</small>
          </Link>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section">
          <Link href="/" onClick={onClose} className="sidebar-item">
            <i className="fa-solid fa-house"></i>
            <span>Personal Workspace</span>
          </Link>
        </div>

        <div className="sidebar-divider" />

        <div className="sidebar-section-label">My Rooms</div>

        {rooms.length === 0 && <p className="sidebar-empty">No rooms yet</p>}

        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/room/${room.id}`}
            onClick={onClose}
            className="sidebar-item"
          >
            <span className="room-dot"></span>
            <span>{room.name}</span>
          </Link>
        ))}

        <div className="sidebar-divider" />

        <div className="sidebar-section">
          <Link href="/invites" onClick={onClose} className="sidebar-item">
            <i className="fa-solid fa-envelope"></i>
            <span>Invites</span>
            {inviteCount > 0 && (
              <span className="invite-badge">{inviteCount}</span>
            )}
          </Link>
          <Link href="/create-room" onClick={onClose} className="sidebar-item">
            <i className="fa-solid fa-plus"></i>
            <span>Create Room</span>
          </Link>
        </div>
      </div>
    </>
  );
}
