import { useEffect, useRef } from "react";
import "./Modal.css";
import { MetaMask } from "@icons";

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
  error = null,
}) => {
  const inputRef = useRef(null);
  const backdropRef = useRef(null);
  const touchStartRef = useRef(null);

  // Configurazioni predefinite per modalità
  const configs = {
    register: {
      title: "Registrazione",
      description: "Per registrarti devi avere un wallet Metamask",
      inputLabel: "Nickname",
      inputPlaceholder: "Il tuo nickname",
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

  const config = configs[mode] || configs.register;

  useEffect(() => {
    if (!isOpen) return;

    // Previeni scroll del body quando la modal è aperta
    document.body.style.overflow = "hidden";

    if (mode === "register") {
      // Delay per garantire che l'input sia renderizzato
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, mode]);

  if (!isOpen) return null;

  // Gestione touch-friendly del backdrop
  const handleTouchStart = (e) => {
    if (e.target === backdropRef.current) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchEnd = (e) => {
    if (e.target === backdropRef.current && touchStartRef.current) {
      const touchEnd = e.changedTouches[0];
      const deltaX = Math.abs(touchEnd.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touchEnd.clientY - touchStartRef.current.y);

      // Chiudi solo se non c'è stato scroll
      if (deltaX < 10 && deltaY < 10) {
        onClose?.();
      }
      touchStartRef.current = null;
    }
  };

  const handleBackdropClick = (e) => {
    // Solo per mouse/click, non touch
    if (e.target === backdropRef.current && e.type === "click") {
      onClose?.();
    }
  };

  const handleSubmit = () => {
    const value = inputRef.current?.value?.trim() ?? "";

    // Validazione semplice per modalità register
    if (mode === "register" && !value) {
      return;
    }

    onSubmit?.(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      onClick={handleBackdropClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="modal" role="dialog" aria-modal="true">
        <h3 className="modal-title">{title || config.title}</h3>
        <p className="modal-description">{description || config.description}</p>

        {mode === "register" && (
          <>
            <p className="input-label">{inputLabel || config.inputLabel}</p>
            <input
              ref={inputRef}
              className="modal-input"
              placeholder={inputPlaceholder || config.inputPlaceholder}
              onKeyPress={handleKeyPress}
              type="text"
              autoComplete="off"
            />
            <p className="input-label-description">
              {inputDescription || config.inputDescription}
            </p>
          </>
        )}

        {error && (
          <div className="modal-error">
            {error}
          </div>
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