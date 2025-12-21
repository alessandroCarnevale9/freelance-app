import "./NavBar.css";
import { HamburgerMenu, CrossIcon } from "@icons";
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
  const [isOpenHamMenu, setIsOpenHamMenu] = useState(false);
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

  // Click outside handling ottimizzato per mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    // Solo mousedown per desktop - evita conflitti con touch
    if (window.innerWidth > 768) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  // Chiudi menu quando cambia la route
  useEffect(() => {
    setIsMenuOpen(false);
    setIsOpenHamMenu(false);
  }, [location.pathname]);

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

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const nonce = await getNonce();

      const signedMessage = await signer.signMessage(nonce);

      return { address, nonce, signedMessage };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error("Firma rifiutata");
      }
      throw error;
    }
  };

  const handleSignupClientClick = async (nicknameValue) => {
    const currentNickname = nicknameValue || nickname;

    if (!currentNickname.trim()) {
      addToast("Inserisci un nickname valido", "error");
      return;
    }

    setNickname(currentNickname);
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

      localStorage.setItem("jwt", JSON.stringify(data));
      dispatch({ type: "LOGIN", payload: data });
      addToast("Registrazione completata con successo!", "success");
      setShowRegistrationModal(false);

      // Piccolo delay prima del navigate per mostrare il toast
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Errore registrazione:", error);
      if (error.code === 4001 || error.message === "Firma rifiutata") {
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
    setIsOpenHamMenu(false);
    setIsMenuOpen(false);

    try {
      const { address, nonce, signedMessage } = await connectWalletAndSign();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signedMessage, nonce }),
      });

      const data = await response.json();

      if (!response.ok || data.success === false) {
        let errorMessage = data.message || "Errore durante il login.";
        if (response.status === 404) {
          errorMessage = "Utente non trovato. Registrati prima.";
        }
        throw new Error(errorMessage);
      }

      localStorage.setItem("jwt", JSON.stringify(data));
      dispatch({ type: "LOGIN", payload: data });
      addToast("Login effettuato con successo!", "success");

      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (error) {
      console.error("Errore login:", error);
      if (error.code === 4001 || error.message === "Firma rifiutata") {
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
    setIsOpenHamMenu(false);
    setIsMenuOpen(false);
    localStorage.removeItem("jwt");
    dispatch({ type: "LOGOUT" });
    navigate("/");
  };

  const toggleRegistrationMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClientRegistration = () => {
    setShowRegistrationModal(true);
    setIsMenuOpen(false);
    setIsOpenHamMenu(false);
  };

  // --- Rendering del Componente ---

  return (
    <div className="nav-bar">
      <div className="nav-bar-inner">
        <h3 className="logo">FreelanceHub</h3>

        {/* Desktop Links */}
        <div className="links">
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
                    onClick={toggleRegistrationMenu}
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
                      onClick={handleClientRegistration}
                    >
                      Cliente
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

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

        {/* Hamburger Menu Icon */}
        {!isOpenHamMenu && (
          <div
            className="hamburger-open"
            onClick={() => setIsOpenHamMenu(true)}
          >
            <HamburgerMenu />
          </div>
        )}

        {isOpenHamMenu && (
          <div
            className="hamburger-close"
            onClick={() => setIsOpenHamMenu(false)}
          >
            <CrossIcon width="25" height="25" fill="#D5D5D5" />
          </div>
        )}

        {/* Mobile Menu */}
        {isOpenHamMenu && (
          <div className="mobile-links">
            {!user && (
              <>
                <button
                  className="logo-btn"
                  onClick={handleLoginClick}
                  disabled={loading}
                >
                  Login
                </button>

                <div className="registration">
                  {location.pathname !== "/registration" && (
                    <button
                      className="registration-btn"
                      onClick={toggleRegistrationMenu}
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
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsOpenHamMenu(false);
                        }}
                      >
                        Freelancer
                      </Link>
                      <div
                        className="registration-dropdown-menu-item"
                        onClick={handleClientRegistration}
                      >
                        Cliente
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

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
        )}
      </div>

      {/* Modale Registrazione Cliente */}
      <Modal
        isOpen={showRegistrationModal}
        onClose={() => {
          if (!loading) {
            setShowRegistrationModal(false);
          }
        }}
        onSubmit={handleSignupClientClick}
        mode="register"
        error={null}
      />

      {/* Loading Overlay */}
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