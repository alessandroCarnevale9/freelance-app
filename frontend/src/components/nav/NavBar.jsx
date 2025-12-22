import "./NavBar.css";
import { HamburgerMenu, CrossIcon } from "@icons";
import Modal from "../modal/Modal.jsx";
import Toast from "../toast/Toast.jsx";
import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { useLogin } from "../../hooks/useLogin";
import { useSignup } from "../../hooks/useSignup";
import { useLogout } from "../../hooks/useLogout";
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

  const { user } = useAuthContext();
  const { login, isLoading: isLoginLoading, error: loginError } = useLogin();
  const { signup, isLoading: isSignupLoading, error: signupError } = useSignup();
  const { logout } = useLogout();

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
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setIsMenuOpen(false);
      }
    };

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
        addToast("Hai rifiutato la firma su MetaMask.", "error");
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

      // Usa l'hook useSignup
      await signup({
        address,
        nickname: currentNickname,
        role: "CLIENT", // Maiuscolo per corrispondere al backend
        signedMessage,
        nonce,
      });

      addToast("Registrazione completata con successo!", "success");
      setShowRegistrationModal(false);

      // Piccolo delay prima del navigate per mostrare il toast
      setTimeout(() => {
        navigate("/client-dashboard");
      }, 500);
    } catch (error) {
      console.error("Errore registrazione:", error);
      // Gli errori specifici sono già gestiti dall'hook e mostrati tramite useEffect
      if (error.message === "Firma rifiutata") {
        // Già gestito in connectWalletAndSign
      } else if (error.message.includes("already exists")) {
        addToast(
          "Questo wallet è già registrato! Prova a fare login.",
          "error"
        );
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

      // Usa l'hook useLogin
      await login({ address, signedMessage, nonce });

      addToast("Login effettuato con successo!", "success");

      // Nota: l'hook useLogin ha già fatto dispatch, quindi il context è aggiornato
      // Aspettiamo un po' prima di leggere dal localStorage
      setTimeout(() => {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (userData?.role === "FREELANCER") {
          navigate("/freelancer-dashboard");
        } else if (userData?.role === "CLIENT") {
          navigate("/client-dashboard");
        } else {
          navigate("/dashboard");
        }
      }, 500);
    } catch (error) {
      console.error("Errore login:", error);
      // Gli errori specifici sono già gestiti dall'hook e mostrati tramite useEffect
      if (error.message === "Firma rifiutata") {
        // Già gestito in connectWalletAndSign
      } else if (
        error.message.includes("not found") ||
        error.message.includes("non trovato") ||
        error.message.includes("Registrati prima")
      ) {
        addToast("Utente non trovato! Prova a registrarti.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    setIsOpenHamMenu(false);
    setIsMenuOpen(false);
    logout(); // Usa l'hook useLogout
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

  // Funzione per gestire il click sul logo
  const handleLogoClick = () => {
    if (!user) {
      // Se non loggato, vai alla home
      navigate("/");
    } else {
      // Se loggato, vai alla dashboard appropriata
      // Ora user ha già la struttura corretta: { address, nickname, role }
      if (user.role === 'FREELANCER') {
        navigate("/freelancer-dashboard");
      } else if (user.role === 'CLIENT') {
        navigate("/client-dashboard");
      } else {
        navigate("/dashboard");
      }
    }
  };

  // Determina se ci sono operazioni in corso
  const isOperationLoading = loading || isLoginLoading || isSignupLoading;

  // --- Rendering del Componente ---

  return (
    <div className="nav-bar">
      <div className="nav-bar-inner">
        <h3 className="logo" onClick={handleLogoClick}>
          FreelanceHub
        </h3>

        {/* Desktop Links */}
        <div className="links">
          {!user && (
            <>
              <button
                className="logo-btn"
                onClick={handleLoginClick}
                disabled={isOperationLoading}
              >
                Login
              </button>

              {/* Dropdown Registrazione */}
              <div className="registration-link" ref={menuRef}>
                {location.pathname !== "/registration" && (
                  <button
                    className="registration-btn"
                    onClick={toggleRegistrationMenu}
                    disabled={isOperationLoading}
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
              disabled={isOperationLoading}
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
                  disabled={isOperationLoading}
                >
                  Login
                </button>

                <div className="registration">
                  {location.pathname !== "/registration" && (
                    <button
                      className="registration-btn"
                      onClick={toggleRegistrationMenu}
                      disabled={isOperationLoading}
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
                disabled={isOperationLoading}
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
          if (!isOperationLoading) {
            setShowRegistrationModal(false);
          }
        }}
        onSubmit={handleSignupClientClick}
        mode="register"
        error={null}
      />

      {/* Loading Overlay */}
      {isOperationLoading && (
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