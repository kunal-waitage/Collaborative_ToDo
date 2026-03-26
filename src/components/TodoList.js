"use client";
import TodoItem from "./TodoItem";

export default function TodoList({ todos, onToggle, onDelete, onEdit }) {
  return (
    <div className="listOfTasks w-75">
      <h4>My List</h4>
      <br />
      <ul id="root">
        {Object.entries(todos).map(([key, todo]) => (
          <TodoItem
            key={key}
            todoKey={key}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        ))}
      </ul>
    </div>
  );
}
