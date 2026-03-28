export default function ConfirmModal({ message, onConfirm, onClose }) {
  if (!message) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-box">
        <p>{message}</p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <button onClick={onClose} className="alert-cancel">
            Cancel
          </button>
          <button onClick={onConfirm} className="alert-ok">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
