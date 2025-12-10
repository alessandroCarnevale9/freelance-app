import { useEffect } from "react";
import "./Toast.css";

const Toast = ({ message, type = "error", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className={`toast-icon toast-icon-${type}`}></span>
        <span className="toast-message">{message}</span>
      </div>
      <button className="toast-close" onClick={onClose} aria-label="Chiudi">
        ×
      </button>
    </div>
  );
};

export default Toast;
