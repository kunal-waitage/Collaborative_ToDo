"use client";
import { useState, useEffect } from "react";
import {
  auth,
  db,
  ref,
  onValue,
  push,
  set,
  remove,
  update,
  get,
} from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar";
import TodoInput from "@/components/TodoInput";
import AlertModal from "@/components/AlertModal";
import EditModal from "@/components/EditModal";
import { useParams } from "next/navigation";

export default function RoomPage() {
  const { roomId } = useParams();
  const [currentUID, setCurrentUID] = useState(null);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState(null);
  const [todos, setTodos] = useState({});
  const [input, setInput] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [editKey, setEditKey] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [members, setMembers] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUID(user.uid);
        get(ref(db, "users/" + user.uid)).then((snap) => {
          if (snap.val()) setUsername(snap.val().username);
        });
        onValue(ref(db, `rooms/${roomId}`), (snap) => setRoom(snap.val()));
        onValue(ref(db, `tasks/${roomId}`), (snap) =>
          setTodos(snap.val() || {}),
        );
        onValue(ref(db, `rooms/${roomId}/members`), async (snap) => {
          const memberUIDs = snap.val();
          if (!memberUIDs) return;
          const memberData = {};
          await Promise.all(
            Object.keys(memberUIDs).map(async (uid) => {
              const userSnap = await get(ref(db, "users/" + uid));
              if (userSnap.val()) memberData[uid] = userSnap.val().username;
            }),
          );
          setMembers(memberData);
        });
      } else {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, [roomId]);

  async function handleAdd() {
    const value = input.trim();
    if (!value) return setAlertMsg("Task cannot be empty");
    const tasksRef = ref(db, "tasks/" + roomId);
    const snapshot = await get(tasksRef);
    const data = snapshot.val();
    const exists = data && Object.values(data).some((t) => t.title === value);
    if (exists) return setAlertMsg("Task already exists");
    const newRef = push(tasksRef);
    await set(newRef, { title: value, completed: false, flaggedBy: null });
    setInput("");
  }

  async function handleToggle(key, completed) {
    await update(ref(db, `tasks/${roomId}/${key}`), { completed });
  }

  async function handleDelete(key) {
    await remove(ref(db, `tasks/${roomId}/${key}`));
  }

  async function handleFlag(key, todo) {
    if (todo.flaggedBy && todo.flaggedBy !== currentUID) {
      return setAlertMsg(
        `Already claimed by @${members[todo.flaggedBy] || "someone"}`,
      );
    }
    const newFlag = todo.flaggedBy === currentUID ? null : currentUID;
    await update(ref(db, `tasks/${roomId}/${key}`), { flaggedBy: newFlag });
  }

  async function handleEditSave(key, newTitle) {
    const value = newTitle.trim();
    if (!value) return setAlertMsg("Task cannot be empty");
    await update(ref(db, `tasks/${roomId}/${key}`), { title: value });
    setEditKey(null);
  }

  async function handleInvite() {
    const inviteUsername = prompt("Enter username to invite:");
    if (!inviteUsername) return;
    const snap = await get(ref(db, "usernames/" + inviteUsername));
    if (!snap.val()) return setAlertMsg("User not found");
    const invitedUID = snap.val();
    if (invitedUID === currentUID)
      return setAlertMsg("You can't invite yourself");
    if (room.members && room.members[invitedUID])
      return setAlertMsg("User is already a member");
    const inviteRef = push(ref(db, "invites/" + invitedUID));
    await set(inviteRef, {
      roomId,
      roomName: room.name,
      fromUsername: username,
      fromUID: currentUID,
      status: "pending",
    });
    setAlertMsg("Invite sent!");
  }

  if (!room)
    return <p style={{ padding: "40px", textAlign: "center" }}>Loading...</p>;

  return (
    <>
      <Navbar currentUID={currentUID} username={username} />
      <div
        style={{ maxWidth: "620px", margin: "0 auto", padding: "40px 20px 0" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}
        >
          <h1 style={{ fontSize: "26px", fontWeight: "600", color: "#0a1628" }}>
            {room.name}
          </h1>
          {room.hostUID === currentUID && (
            <button onClick={handleInvite} className="addBtn">
              + Invite
            </button>
          )}
        </div>
        <div
          style={{
            marginBottom: "16px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
          }}
        >
          {Object.entries(members).map(([uid, uname]) => (
            <span
              key={uid}
              style={{
                background: "#e0f2fe",
                color: "#0a1628",
                padding: "4px 12px",
                borderRadius: "20px",
                fontSize: "12px",
              }}
            >
              @{uname} {room.hostUID === uid ? "👑" : ""}
            </span>
          ))}
        </div>
      </div>

      <TodoInput value={input} onChange={setInput} onAdd={handleAdd} />
      <br />

      <div
        className="listOfTasks w-75"
        style={{ maxWidth: "620px", margin: "0 auto" }}
      >
        <h4>Room Tasks</h4>
        <br />
        <ul id="root" style={{ padding: 0 }}>
          {Object.entries(todos).map(([key, todo]) => (
            <li key={key} className="list-cont">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(key, !todo.completed)}
              />
              <label className="label-cont">
                <h4
                  style={{
                    textDecoration: todo.completed ? "line-through" : "none",
                  }}
                >
                  {todo.title}
                </h4>
                {todo.flaggedBy && (
                  <small style={{ color: "#22d3ee", fontSize: "11px" }}>
                    claimed by @{members[todo.flaggedBy] || "someone"}
                  </small>
                )}
              </label>
              <button
                onClick={() => handleFlag(key, todo)}
                className="editbtn"
                title="Claim task"
              >
                <i
                  className={`fa-${todo.flaggedBy === currentUID ? "solid" : "regular"} fa-flag`}
                  style={{
                    color: todo.flaggedBy ? "#22d3ee" : "#bfdbfe",
                    fontSize: "14px",
                  }}
                ></i>
              </button>
              <button
                onClick={() => {
                  setEditKey(key);
                  setEditTitle(todo.title);
                }}
                className="editbtn"
              >
                <i className="fa-solid fa-pen edit-icon"></i>
              </button>
              <button onClick={() => handleDelete(key)} className="dltbtn">
                <i className="fa-solid fa-trash trash-icon"></i>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <AlertModal message={alertMsg} onClose={() => setAlertMsg("")} />
      <EditModal
        todoKey={editKey}
        currentTitle={editTitle}
        onClose={() => setEditKey(null)}
        onSave={handleEditSave}
      />
    </>
  );
}
