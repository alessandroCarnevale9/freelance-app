import { useEffect, useRef } from "react";
import "./Modal.css";
import { MetaMask, UploadIcon } from "@icons";

const Modal = ({ isOpen, onClose, onSubmit}) => {
  const inputRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === "Escape") onClose?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdrop = (e) => {
    if (e.target === backdropRef.current) onClose?.();
  };

  const handleSubmit = () => {
    const value = inputRef.current?.value ?? "";
    onSubmit?.(value);
    onClose?.();
  };

  return (
    <div className="modal-backdrop" ref={backdropRef} onMouseDown={handleBackdrop}>
      <div className="modal" role="dialog" aria-modal="true">
        <h3 className="modal-title">Registrazione</h3>
        <p className="modal-description">Per registrarti devi avere un wallet Metamask</p>
        <p className="input-label">Nickname</p>
        <input ref={inputRef} className="modal-input" placeholder="" />
        <p className="input-label-description">Aggiungi un nome con cui vuoi esssere chiamato/a su questa piattaforma</p>
        <div className="modal-actions">
          <button className="modal-btn modal-cancel" onClick={onClose}>Annulla</button>
          <button className="modal-btn modal-submit" onClick={handleSubmit}>Registrati <MetaMask /></button>
        </div>
      </div>
    </div>
  );
}

export default Modal;