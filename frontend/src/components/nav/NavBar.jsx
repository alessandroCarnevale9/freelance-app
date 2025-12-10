import "./NavBar.css";
import Modal from "../modal/Modal.jsx";
import { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../../hooks/useAuthContext";
import { ethers } from "ethers";
import { Link, useLocation, useNavigate } from "react-router-dom";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  const { dispatch } = useAuthContext();

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
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMenuOpen]);

  const getNonce = async () => {
    try {
      const response = await fetch("/api/auth/nonce");
      if (!response.ok) throw new Error("Errore ottenimento nonce");
      const data = await response.json();
      return data.nonce;
    } catch (error) {
      console.error("Errore getNonce:", error);
      alert("Errore di connessione al server");
      throw error;
    }
  };

  const connectWalletAndSign = async () => {
    if (!window.ethereum) {
      alert(
        "Per continuare devi installare MetaMask!\n\nVisita: https://metamask.io"
      );
      throw new Error("MetaMask non installato");
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    const nonce = await getNonce();
    const signedMessage = await signer.signMessage(nonce);

    return { address, nonce, signedMessage };
  };

  const handleSignupClientClick = async () => {
    if (!nickname.trim()) {
      alert("Inserisci un nickname valido");
      return;
    }

    setLoading(true);
    try {
      const { address, nonce, signedMessage } = await connectWalletAndSign();

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          nickname,
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
      navigate("/dashboard");
    } catch (error) {
      console.error("Errore registrazione:", error);
      if (error.code === 4001) {
        alert("Hai rifiutato la firma su MetaMask");
      } else if (error.message.includes("already exists")) {
        alert("Questo wallet è già registrato! Prova a fare login.");
      } else {
        alert(`Errore: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = async () => {
    // if (!nickname.trim()) {
    //   alert("Inserisci un nickname valido");
    //   return;
    // }

    setLoading(true);
    try {
      const { address, nonce, signedMessage } = await connectWalletAndSign();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, /*nickname,*/ signedMessage, nonce }),
      });

      const data = await response.json();

      if (!response.ok) {
        switch (response.status) {
          case 400:
            throw new Error(
              data.message || "Dati mancanti. Controlla i campi."
            );
          case 401:
            throw new Error(
              data.message ||
                "Autenticazione fallita."
            );
          case 404:
            throw new Error(
              data.message || "Utente non trovato. Registrati prima."
            );
          default:
            throw new Error(data.message || "Errore durante il login.");
        }
      }

      if (data.success === false)
        throw new Error(data.message || "Login fallito");

      localStorage.setItem("jwt", JSON.stringify(data));
      dispatch({ type: "LOGIN", payload: data });
      navigate("/dashboard");
    } catch (error) {
      console.error("Errore login:", error);
      if (error.code === 4001) {
        alert("Hai rifiutato la firma su MetaMask");
      } else if (
        error.message.includes("not found") ||
        error.message.includes("non trovato")
      ) {
        alert("Utente non trovato! Prova a registrarti.");
      } else {
        alert(`Errore: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nav-bar">
      <div className="nav-bar-inner">
        <h3 className="logo">FreelanceHub</h3>
        <div className="links">
          <div className="logo-btn" onClick={() => setShowLoginModal(true)}>
            Login
          </div>
          <div className="registration-link" ref={menuRef}>
            {location.pathname !== "/registration" && (
              <div
                className="registration-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                Registrati
              </div>
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
        </div>
      </div>

      <Modal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSubmit={handleSignupClientClick}
        mode="register"
      />

      <Modal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSubmit={handleLoginClick}
        mode="login"
      />

      {loading && (
        <div className="loading-overlay">
          <div className="spinner">
            {showLoginModal ? "Login in corso..." : "Registrazione in corso..."}
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
