import "./NavBar.css";
import Modal from "../modal/Modal.jsx";
import Toast from "../toast/Toast.jsx";
import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { ethers } from "ethers";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const menuRef = useRef(null);

  const [nickname, setNickname] = useState("");

  const { user, dispatch } = useAuthContext();

  // Funzione per aggiungere un toast
  const addToast = (message, type = "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  // Funzione per rimuovere un toast
  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Controlla se il menu è aperto E se il click è fuori dal menu
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    // Aggiunge gli ascoltatori di eventi
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    // Rimuove gli ascoltatori di eventi al cleanup
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  // --- Funzioni di Autenticazione ---

  const getNonce = async () => {
    try {
      const response = await fetch("/api/auth/nonce");
      if (!response.ok) throw new Error("Errore ottenimento nonce");
      const data = await response.json();
      return data.nonce;
    } catch (error) {
      console.error("Errore getNonce:", error);
      addToast("Errore di connessione al server.", "error");
      throw error;
    }
  };

  const connectWalletAndSign = async () => {
    if (!window.ethereum) {
      addToast(
        "Per continuare devi installare MetaMask! Visita: https://metamask.io",
        "error"
      );
      throw new Error("MetaMask non installato");
    }

    // Assicurati che l'utente abbia dato il consenso
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const nonce = await getNonce();

    // Firma il nonce per l'autenticazione
    const signedMessage = await signer.signMessage(nonce);

    return { address, nonce, signedMessage };
  };

  const handleSignupClientClick = async (nicknameValue) => {
    // Aggiorna il nickname se proviene dalla modale
    const currentNickname = nicknameValue || nickname;

    if (!currentNickname.trim()) {
      addToast("Inserisci un nickname valido", "error");
      return;
    }

    setNickname(currentNickname); // Aggiorna lo stato anche se proviene dal parametro
    setLoading(true);

    try {
      const { address, nonce, signedMessage } = await connectWalletAndSign();

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          nickname: currentNickname,
          role: "client",
          signedMessage,
          nonce,
        }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Registrazione fallita");
      }

      // Login di successo
      localStorage.setItem("jwt", JSON.stringify(data));
      dispatch({ type: "LOGIN", payload: data });
      addToast("Registrazione completata con successo!", "success");
      setShowRegistrationModal(false);
      navigate("/dashboard");
    } catch (error) {
      console.error("Errore registrazione:", error);
      if (error.code === 4001) {
        addToast("Hai rifiutato la firma su MetaMask.", "error");
      } else if (error.message.includes("already exists")) {
        addToast(
          "Questo wallet è già registrato! Prova a fare login.",
          "error"
        );
      } else {
        addToast(`Errore: ${error.message}`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = async () => {
    setLoading(true);
    try {
      const { address, nonce, signedMessage } = await connectWalletAndSign();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signedMessage, nonce }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        // Gestione degli errori basata sullo stato e/o messaggio
        let errorMessage = data.message || "Errore durante il login.";
        if (response.status === 404) {
          errorMessage = "Utente non trovato. Registrati prima.";
        }
        throw new Error(errorMessage);
      }

      // Login di successo
      localStorage.setItem("jwt", JSON.stringify(data));
      dispatch({ type: "LOGIN", payload: data });
      addToast("Login effettuato con successo!", "success");
      navigate("/dashboard");
    } catch (error) {
      console.error("Errore login:", error);
      if (error.code === 4001) {
        addToast("Hai rifiutato la firma su MetaMask.", "error");
      } else if (
        error.message.includes("not found") ||
        error.message.includes("non trovato") ||
        error.message.includes("Registrati prima")
      ) {
        addToast("Utente non trovato! Prova a registrarti.", "error");
      } else {
        addToast(`Errore: ${error.message}`, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = async () => {
    localStorage.removeItem("jwt");
    dispatch({ type: "LOGOUT" });
  };

  // --- Rendering del Componente ---

  return (
    <div className="nav-bar">
      <div className="nav-bar-inner">
        <h3 className="logo">FreelanceHub</h3>
        <div className="links">
          {/* Blocchi Login/Registrazione (Se NON loggato) */}
          {!user && (
            <>
              <button
                className="logo-btn"
                onClick={handleLoginClick}
                disabled={loading}
              >
                Login
              </button>

              {/* Dropdown Registrazione */}
              <div className="registration-link" ref={menuRef}>
                {location.pathname !== "/registration" && (
                  <button
                    className="registration-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    disabled={loading}
                  >
                    Registrati
                  </button>
                )}
                {isMenuOpen && (
                  <div className="registration-dropdown-menu">
                    <Link
                      className="registration-dropdown-menu-item"
                      to="/registration"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Freelancer
                    </Link>
                    <div
                      className="registration-dropdown-menu-item"
                      onClick={() => {
                        setShowRegistrationModal(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      Cliente
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Bottone Logout (Se loggato) */}
          {user && (
            <button
              className="logout-btn"
              onClick={handleLogoutClick}
              disabled={loading}
            >
              Log out
            </button>
          )}
        </div>
      </div>

      {/* Modale Registrazione Cliente */}
      <Modal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSubmit={handleSignupClientClick}
        mode="register"
        onNicknameChange={setNickname}
        error={null} // L'errore viene gestito tramite Toast
      />

      {/* Loading Overlay CORRETTO */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner"></div>
            <div className="loading-text">
              {showRegistrationModal
                ? "Registrazione in corso..."
                : "Login in corso..."}
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default NavBar;
