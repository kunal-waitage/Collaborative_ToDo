"use client";
import { useState, useEffect } from "react";
import {
  auth,
  db,
  ref,
  push,
  set,
  onValue,
  remove,
  update,
  get,
} from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Navbar from "@/components/Navbar";
import TodoInput from "@/components/TodoInput";
import TodoList from "@/components/TodoList";
import AlertModal from "@/components/AlertModal";
import EditModal from "@/components/EditModal";

export default function Home() {
  const [todos, setTodos] = useState({});
  const [input, setInput] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [currentUID, setCurrentUID] = useState(null);
  const [username, setUsername] = useState("");
  const [editKey, setEditKey] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUID(user.uid);

        const userRef = ref(db, "users/" + user.uid);
        onValue(userRef, (snapshot) => {
          const data = snapshot.val();
          if (data) setUsername(data.username);
        });

        const tasksRef = ref(db, "tasks/" + user.uid);
        onValue(tasksRef, (snapshot) => {
          setTodos(snapshot.val() || {});
        });
      } else {
        window.location.href = "/login";
      }
    });
    return () => unsubscribe();
  }, []);

  async function handleAdd() {
    const value = input.trim();
    if (!value) return setAlertMsg("Task cannot be empty");
    const tasksRef = ref(db, "tasks/" + currentUID);
    const snapshot = await get(tasksRef);
    const data = snapshot.val();
    const exists = data && Object.values(data).some((t) => t.title === value);
    if (exists) return setAlertMsg("Task already exists");
    const newRef = push(tasksRef);
    await set(newRef, { title: value, completed: false });
    setInput("");
  }

  async function handleToggle(key, completed) {
    await update(ref(db, `tasks/${currentUID}/${key}`), { completed });
  }

  async function handleDelete(key) {
    await remove(ref(db, `tasks/${currentUID}/${key}`));
  }

  function handleEditOpen(key, title) {
    setEditKey(key);
    setEditTitle(title);
  }

  async function handleEditSave(key, newTitle) {
    const value = newTitle.trim();
    if (!value) return setAlertMsg("Task cannot be empty");
    await update(ref(db, `tasks/${currentUID}/${key}`), { title: value });
    setEditKey(null);
    setEditTitle("");
  }

  return (
    <>
      <Navbar currentUID={currentUID} username={username} />
      <h1 className="mainHeading">My To-Do List</h1>
      <TodoInput value={input} onChange={setInput} onAdd={handleAdd} />
      <br />
      {Object.keys(todos).length > 0 && (
        <TodoList
          todos={todos}
          onToggle={handleToggle}
          onDelete={handleDelete}
          onEdit={handleEditOpen}
        />
      )}
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
