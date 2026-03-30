"use client";
import { useEffect, useState } from "react";
import { db, ref, onValue } from "@/lib/firebase";

export default function ActivityLog({ roomId }) {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const activityRef = ref(db, `activity/${roomId}`);
    onValue(activityRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setLogs([]);
        return;
      }
      const list = Object.values(data)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);
      setLogs(list);
    });
  }, [roomId]);

  if (logs.length === 0) return null;

  return (
    <div
      style={{ maxWidth: "620px", margin: "32px auto", padding: "0 20px 40px" }}
    >
      <h4
        style={{
          fontSize: "11px",
          color: "#7a9cc0",
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          marginBottom: "14px",
        }}
      >
        Activity
      </h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {logs.map((log, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "13px",
              color: "#0a1628",
            }}
          >
            <span style={{ color: "#22d3ee", fontSize: "11px", flexShrink: 0 }}>
              {log.timestamp
                ? new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
