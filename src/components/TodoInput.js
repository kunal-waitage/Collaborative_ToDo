"use client";

export default function TodoInput({ value, onChange, onAdd }) {
  return (
    <div className="input-wrapper">
      <input
        className="mainInputField"
        type="text"
        placeholder="What needs to be done?"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button onClick={onAdd} className="addBtn">
        + Add Task
      </button>
    </div>
  );
}
