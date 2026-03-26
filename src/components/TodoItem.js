"use client";

export default function TodoItem({
  todoKey,
  todo,
  onToggle,
  onDelete,
  onEdit,
}) {
  return (
    <li className="list-cont">
      <input
        type="checkbox"
        id={"checkbox" + todoKey}
        checked={todo.completed}
        onChange={() => onToggle(todoKey, !todo.completed)}
      />
      <label htmlFor={"checkbox" + todoKey} className="label-cont">
        <h4
          style={{ textDecoration: todo.completed ? "line-through" : "none" }}
        >
          {todo.title}
        </h4>
      </label>
      <button onClick={() => onEdit(todoKey, todo.title)} className="editbtn">
        <i className="fa-solid fa-pen edit-icon"></i>
      </button>
      <button onClick={() => onDelete(todoKey)} className="dltbtn">
        <i className="fa-solid fa-trash trash-icon"></i>
      </button>
    </li>
  );
}
