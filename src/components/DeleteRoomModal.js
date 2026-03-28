"use client";
import { useState } from "react";

export default function DeleteRoomModal({ roomName, onConfirm, onClose }) {
  const [value, setValue] = useState("");
  const matches = value === roomName;

  if (!roomName) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-box">
        <p style={{ fontWeight: "500", marginBottom: "8px" }}>Delete Room</p>
        <p style={{ fontSize: "13px", color: "#7a9cc0", marginBottom: "16px" }}>
          Type <strong style={{ color: "#0a1628" }}>{roomName}</strong> to
          confirm deletion
        </p>
        <input
          className="form-control mb-3"
          type="text"
          placeholder="Type room name..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={onClose} className="alert-cancel">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="alert-ok"
            disabled={!matches}
            style={{
              opacity: matches ? 1 : 0.4,
              cursor: matches ? "pointer" : "not-allowed",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
