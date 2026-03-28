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
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import TodoInput from "@/components/TodoInput";
import AlertModal from "@/components/AlertModal";
import EditModal from "@/components/EditModal";
import ConfirmModal from "@/components/ConfirmModal";
import DeleteRoomModal from "@/components/DeleteRoomModal";

export default function RoomPage() {
  const { roomId } = useParams();
  const [currentUID, setCurrentUID] = useState(null);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState(null);
  const [todos, setTodos] = useState({});
  const [input, setInput] = useState("");
  const [members, setMembers] = useState({});
  const [alertMsg, setAlertMsg] = useState("");
  const [editKey, setEditKey] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [confirmMsg, setConfirmMsg] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const isHost = room?.hostUID === currentUID;

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

  // ── TASKS ──
  async function handleAdd() {
    const value = input.trim();
    if (!value) return setAlertMsg("Task cannot be empty");
    const tasksRef = ref(db, "tasks/" + roomId);
    const snapshot = await get(tasksRef);
    const data = snapshot.val();
    const exists = data && Object.values(data).some((t) => t.title === value);
    if (exists) return setAlertMsg("Task already exists");
    const newRef = push(tasksRef);
    await set(newRef, {
      title: value,
      completed: false,
      flaggedBy: null,
      assignedTo: null,
    });
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

  async function handleAssign(key, uid) {
    await update(ref(db, `tasks/${roomId}/${key}`), {
      assignedTo: uid === "none" ? null : uid,
    });
  }

  async function handleEditSave(key, newTitle) {
    const value = newTitle.trim();
    if (!value) return setAlertMsg("Task cannot be empty");
    await update(ref(db, `tasks/${roomId}/${key}`), { title: value });
    setEditKey(null);
  }

  // ── INVITE ──
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

  // ── REMOVE MEMBER ──
  function promptRemoveMember(uid, uname) {
    setConfirmMsg(`Are you sure you want to remove @${uname} from the room?`);
    setConfirmAction(() => async () => {
      const tasksSnap = await get(ref(db, `tasks/${roomId}`));
      const data = tasksSnap.val();
      if (data) {
        await Promise.all(
          Object.entries(data)
            .filter(([, todo]) => todo.flaggedBy === uid)
            .map(([key]) =>
              update(ref(db, `tasks/${roomId}/${key}`), { flaggedBy: null }),
            ),
        );
      }
      await remove(ref(db, `rooms/${roomId}/members/${uid}`));
      setConfirmMsg("");
    });
  }

  // ── DELETE ROOM ──
  async function handleDeleteRoom() {
    await remove(ref(db, `rooms/${roomId}`));
    await remove(ref(db, `tasks/${roomId}`));
    window.location.href = "/";
  }

  // ── LEAVE ROOM ──

  function promptLeaveRoom() {
    setConfirmMsg("Are you sure you want to leave this room?");
    setConfirmAction(() => async () => {
      const tasksSnap = await get(ref(db, `tasks/${roomId}`));
      const data = tasksSnap.val();
      if (data) {
        await Promise.all(
          Object.entries(data)
            .filter(([, todo]) => todo.flaggedBy === currentUID)
            .map(([key]) =>
              update(ref(db, `tasks/${roomId}/${key}`), { flaggedBy: null }),
            ),
        );
      }
      await remove(ref(db, `rooms/${roomId}/members/${currentUID}`));
      setConfirmMsg("");
      window.location.href = "/";
    });
  }

  if (!room)
    return <p style={{ padding: "40px", textAlign: "center" }}>Loading...</p>;

  return (
    <>
      <Navbar currentUID={currentUID} username={username} />

      <div
        style={{ maxWidth: "620px", margin: "0 auto", padding: "40px 20px 0" }}
      >
        {/* Room Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h1 style={{ fontSize: "26px", fontWeight: "600", color: "#0a1628" }}>
            {room.name}
          </h1>
          <div style={{ display: "flex", gap: "10px" }}>
            {isHost && (
              <button onClick={handleInvite} className="addBtn">
                + Invite
              </button>
            )}
            {!isHost && (
              <button
                onClick={promptLeaveRoom}
                className="alert-cancel"
                style={{ borderColor: "#ef4444", color: "#ef4444" }}
              >
                Leave Room
              </button>
            )}
            {isHost && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="alert-cancel"
                style={{ borderColor: "#ef4444", color: "#ef4444" }}
              >
                Delete Room
              </button>
            )}
          </div>
        </div>

        {/* Members */}
        <div
          style={{
            marginBottom: "24px",
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {Object.entries(members).map(([uid, uname]) => (
            <div
              key={uid}
              style={{ display: "flex", alignItems: "center", gap: "4px" }}
            >
              <span
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
              {isHost && uid !== currentUID && (
                <button
                  onClick={() => promptRemoveMember(uid, uname)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: "0 4px",
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Task Input */}
      <TodoInput value={input} onChange={setInput} onAdd={handleAdd} />
      <br />

      {/* Task List */}
      <div
        className="listOfTasks"
        style={{ maxWidth: "620px", margin: "0 auto", padding: "0 20px" }}
      >
        <h4>Room Tasks</h4>
        <br />
        <ul style={{ padding: 0 }}>
          {Object.entries(todos).map(([key, todo]) => (
            <li
              key={key}
              className="list-cont"
              style={{
                height: "auto",
                padding: "12px 16px",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(key, !todo.completed)}
                style={{
                  width: "18px",
                  height: "18px",
                  accentColor: "#22d3ee",
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: "120px" }}>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#0a1628",
                    textDecoration: todo.completed ? "line-through" : "none",
                    margin: 0,
                  }}
                >
                  {todo.title}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginTop: "4px",
                    flexWrap: "wrap",
                  }}
                >
                  {todo.flaggedBy && (
                    <small style={{ color: "#22d3ee", fontSize: "11px" }}>
                      🚩 claimed by @{members[todo.flaggedBy] || "someone"}
                    </small>
                  )}
                  {todo.assignedTo && (
                    <small style={{ color: "#7a9cc0", fontSize: "11px" }}>
                      👤 assigned to @{members[todo.assignedTo] || "someone"}
                    </small>
                  )}
                </div>
              </div>

              {/* Assign dropdown — host only */}
              {isHost && (
                <select
                  value={todo.assignedTo || "none"}
                  onChange={(e) => handleAssign(key, e.target.value)}
                  style={{
                    fontSize: "12px",
                    border: "1px solid #bfdbfe",
                    borderRadius: "8px",
                    padding: "4px 8px",
                    color: "#0a1628",
                    background: "#f0f7ff",
                  }}
                >
                  <option value="none">Assign to...</option>
                  {Object.entries(members).map(([uid, uname]) => (
                    <option key={uid} value={uid}>
                      @{uname}
                    </option>
                  ))}
                </select>
              )}

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

      {/* Modals */}
      <AlertModal message={alertMsg} onClose={() => setAlertMsg("")} />
      <EditModal
        todoKey={editKey}
        currentTitle={editTitle}
        onClose={() => setEditKey(null)}
        onSave={handleEditSave}
      />
      <ConfirmModal
        message={confirmMsg}
        onConfirm={confirmAction}
        onClose={() => setConfirmMsg("")}
      />
      <DeleteRoomModal
        roomName={showDeleteModal ? room.name : null}
        onConfirm={handleDeleteRoom}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
}
