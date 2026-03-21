import {
  db,
  auth,
  ref,
  push,
  set,
  onValue,
  remove,
  update,
  get,
} from "./firebase_config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

let currentUID = null;

onAuthStateChanged(auth, (user) => {
  if (user) {
    currentUID = user.uid;
    console.log("Logged in UID:", currentUID);

    const tasksRef = ref(db, "tasks/" + currentUID);

    onValue(tasksRef, (snapshot) => {
      rootEl.innerHTML = "";

      const data = snapshot.val();
      if (!data) return;

      Object.entries(data).forEach(([key, todo]) => {
        renderTodo(key, todo);
      });
    });
  } else {
    // If not logged in, send back to login page
    window.location.href = "login.html";
  }
});

// const tasksRef = ref(db, "tasks");

// DOM
const rootEl = document.getElementById("root");
const userInEl = document.getElementById("userIn");
const addBtnEl = document.getElementById("addBtn");
const closeAlertBtnEl = document.getElementById("closeAlertbtn");

addBtnEl.addEventListener("click", handleAddTodo);
closeAlertBtnEl.addEventListener("click", closeAlert);

// ================= REALTIME LISTENER =================

// ================= RENDER =================

function renderTodo(key, todo) {
  const listEl = document.createElement("li");
  listEl.classList.add("list-cont");

  const checkboxId = "checkbox" + key;

  const checkBoxEl = document.createElement("input");
  checkBoxEl.type = "checkbox";
  checkBoxEl.id = checkboxId;
  checkBoxEl.checked = todo.completed === true;

  checkBoxEl.addEventListener("change", () => {
    update(ref(db, `tasks/${currentUID}/${key}`), {
      completed: checkBoxEl.checked,
    });
  });

  listEl.appendChild(checkBoxEl);

  const labelEl = document.createElement("label");
  labelEl.setAttribute("for", checkboxId);
  labelEl.classList.add("label-cont");

  const titleEl = document.createElement("h4");
  titleEl.textContent = todo.title;
  if (todo.completed) titleEl.style.textDecoration = "line-through";

  labelEl.appendChild(titleEl);
  listEl.appendChild(labelEl);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("dltbtn");
  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-trash", "trash-icon");
  deleteBtn.appendChild(icon);

  deleteBtn.addEventListener("click", () =>
    remove(ref(db, `tasks/${currentUID}/${key}`)),
  );

  listEl.appendChild(deleteBtn);
  rootEl.appendChild(listEl);
}

// ================= ADD =================

async function handleAddTodo() {
  // window.location.href = "new.html";
  const value = userInEl.value.trim();
  if (!value) return showAlert("Task cannot be empty");

  const tasksRef = ref(db, "tasks/" + currentUID);
  const snapshot = await get(tasksRef);
  const data = snapshot.val();
  const exists =
    data && Object.values(data).some((todo) => todo.title === value);
  if (exists) return showAlert("Task already exists");

  const newRef = push(tasksRef);
  await set(newRef, { title: value, completed: false });
  userInEl.value = "";
}

// ================= ALERT =================

function showAlert(message) {
  document.getElementById("alertMessage").textContent = message;
  document.getElementById("customAlert").classList.remove("hidden");
}

function closeAlert() {
  document.getElementById("customAlert").classList.add("hidden");
}
