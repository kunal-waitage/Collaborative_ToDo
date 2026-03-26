"use client";
import { useState, useEffect } from "react";

export default function EditModal({ todoKey, currentTitle, onClose, onSave }) {
  const [value, setValue] = useState(currentTitle);

  useEffect(() => {
    setValue(currentTitle);
  }, [currentTitle]);

  if (!todoKey) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-box">
        <p style={{ marginBottom: "12px", fontWeight: "500" }}>Edit Task</p>
        <input
          className="form-control mb-3"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={onClose} className="alert-cancel">
            Cancel
          </button>
          <button onClick={() => onSave(todoKey, value)} className="alert-ok">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
