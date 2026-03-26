export default function AlertModal({ message, onClose }) {
  if (!message) return null;

  return (
    <div className="alert-overlay">
      <div className="alert-box">
        <p>{message}</p>
        <button onClick={onClose} className="alert-ok">
          OK
        </button>
      </div>
    </div>
  );
}
