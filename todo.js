// DOM
const rootEl = document.getElementById("root");
const userInEl = document.getElementById("userIn");
const addBtnEl = document.getElementById("addBtn");

addBtnEl.addEventListener("click", handleAddTodo);

let todos = [];

// ================= Render List =================

function renderTodos() {
  rootEl.innerHTML = "";

  todos.forEach((todo, index) => {
    renderTodo(index, todo);
  });
}

function renderTodo(index, todo) {
  const listEl = document.createElement("li");
  listEl.classList.add("list-cont");

  const checkboxId = "checkbox" + index;

  const checkBoxEl = document.createElement("input");
  checkBoxEl.type = "checkbox";
  checkBoxEl.id = checkboxId;
  checkBoxEl.checked = todo.completed;

  checkBoxEl.addEventListener("change", () => {
    todos[index].completed = checkBoxEl.checked;
    renderTodos();
  });

  listEl.appendChild(checkBoxEl);

  const labelEl = document.createElement("label");
  labelEl.setAttribute("for", checkboxId);
  labelEl.classList.add("label-cont");

  const titleEl = document.createElement("h4");
  titleEl.textContent = todo.title;

  if (todo.completed) {
    titleEl.style.textDecoration = "line-through";
  }

  labelEl.appendChild(titleEl);
  listEl.appendChild(labelEl);

  const deleteBtn = document.createElement("button");
  deleteBtn.classList.add("dltbtn");
  //   deleteBtn.textContent = "Delete";
  const icon = document.createElement("i");
  icon.classList.add("fa-solid", "fa-trash", "trash-icon");
  deleteBtn.appendChild(icon);

  deleteBtn.addEventListener("click", () => {
    todos.splice(index, 1);
    renderTodos();
  });

  listEl.appendChild(deleteBtn);
  rootEl.appendChild(listEl);
}

// ================= Add to List =================

function handleAddTodo() {
  const value = userInEl.value.trim();

  if (!value) {
    alert("Task cannot be Empty!");
    return;
  }

  const exists = todos.some((todo) => todo.title === value);

  if (exists) {
    alert("Task already exists!");
    return;
  }

  todos.push({
    title: value,
    completed: false,
  });

  userInEl.value = "";

  renderTodos();
}
