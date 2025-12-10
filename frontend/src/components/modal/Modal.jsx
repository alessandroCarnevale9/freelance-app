import { useEffect, useRef } from "react";
import "./Modal.css";
import { MetaMask, UploadIcon } from "@icons";

const Modal = ({
  isOpen,
  onClose,
  onSubmit,
  mode = "register", // "register" o "login"
  title,
  description,
  inputLabel,
  inputPlaceholder = "",
  inputDescription,
  submitButtonText,
  showMetaMaskIcon = true,
  showCancelButton = true,
}) => {
  const inputRef = useRef(null);
  const backdropRef = useRef(null);

  // Configurazioni predefinite per modalità
  const configs = {
    register: {
      title: "Registrazione",
      description: "Per registrarti devi avere un wallet Metamask",
      inputLabel: "Nickname",
      inputPlaceholder: "Il tuo nickname", // Aggiunto placeholder di default per chiarezza
      inputDescription:
        "Aggiungi un nome con cui vuoi essere chiamato/a su questa piattaforma",
      submitButtonText: "Registrati",
    },
    login: {
      title: "Login",
      description: "Accedi con il tuo wallet Metamask",
      inputLabel: "",
      inputPlaceholder: "",
      inputDescription: "",
      submitButtonText: "Accedi",
    },
  };

  // Ottiene la configurazione basandosi sul mode, altrimenti usa 'register'
  const config = configs[mode] || configs.register;

  useEffect(() => {
    if (!isOpen) return;
    // Tenta di mettere a fuoco solo se l'input field è effettivamente mostrato (mode === 'register')
    if (mode === "register") {
      inputRef.current?.focus();
    }

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, mode]); // Aggiunto mode come dipendenza per useEffect

  if (!isOpen) return null;

  const handleBackdrop = (e) => {
    if (e.target === backdropRef.current) onClose?.();
  };

  const handleSubmit = () => {
    // Il valore è necessario solo in modalità "register", altrimenti è una stringa vuota
    const value = inputRef.current?.value ?? "";
    onSubmit?.(value);
    onClose?.();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onMouseDown={handleBackdrop}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <h3 className="modal-title">{title || config.title}</h3>
        <p className="modal-description">{description || config.description}</p>

        {/* === RENDERIZZAZIONE CONDIZIONALE: Mostra solo se mode è 'register' === */}
        {mode === "register" && (
          <>
            <p className="input-label">{inputLabel || config.inputLabel}</p>
            <input
              ref={inputRef}
              className="modal-input"
              placeholder={inputPlaceholder || config.inputPlaceholder}
              onKeyPress={handleKeyPress}
            />
            <p className="input-label-description">
              {inputDescription || config.inputDescription}
            </p>
          </>
        )}

        <div className="modal-actions">
          {showCancelButton && (
            <button className="modal-btn modal-cancel" onClick={onClose}>
              Annulla
            </button>
          )}
          <button className="modal-btn modal-submit" onClick={handleSubmit}>
            {submitButtonText || config.submitButtonText}
            {showMetaMaskIcon && <MetaMask />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
