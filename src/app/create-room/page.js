"use client";
import { useState, useEffect } from "react";
import { auth, db, ref, push, set, get } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar";

export default function CreateRoom() {
  const [roomName, setRoomName] = useState("");
  const [currentUID, setCurrentUID] = useState(null);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUID(user.uid);
        get(ref(db, "users/" + user.uid)).then((snap) => {
          if (snap.val()) setUsername(snap.val().username);
        });
      } else {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleCreate() {
    if (!roomName.trim()) return setError("Room name cannot be empty");
    const roomsRef = ref(db, "rooms");
    const newRoom = push(roomsRef);
    await set(newRoom, {
      name: roomName.trim(),
      hostUID: currentUID,
      members: { [currentUID]: true },
    });
    window.location.href = `/room/${newRoom.key}`;
  }

  return (
    <>
      <Navbar currentUID={currentUID} username={username} />
      <div className="auth-container" style={{ marginTop: "60px" }}>
        <h2>Create a Room</h2>
        {error && <p className="error-msg">{error}</p>}
        <input
          type="text"
          placeholder="Room name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="form-control mb-3"
        />
        <button onClick={handleCreate} className="btn btn-outline-danger w-100">
          Create Room
        </button>
      </div>
    </>
  );
}
