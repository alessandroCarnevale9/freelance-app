import "./NavBar.css";
import Modal from "../modal/Modal.jsx";
import {useState, useRef, useEffect} from "react";
import { ethers } from "ethers";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
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

  const handleLoginClick = async () => {
    const provider = ((window.ethereum != null) ? new ethers.providers.Web3Provider(window.ethereum) : ethers.providers.getDefaultProvider());
    await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    // Sign the message using the signer account and the nonce value
    const message = `I am signing this message to prove my identity. Nonce: ${nonce}`;
    const signedMessage = await signer.signMessage(message);
    const data = { signedMessage, message, address };
    console.log(data);
  }

  const getNonce = async () => {
    const response = await fetch('/api/auth/nonce');
    const data = await response.json();
    return data.nonce;
  }

  const handleSignupClientClick = async (nickname) => { 
    const nonce = await getNonce();
    if(window.ethereum != null) { 
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const role = "client";
      const message = `I am signing this message to prove my identity. Nonce: ${nonce}`;
      const signedMessage = await signer.signMessage(message);
      const data = { address, nickname, role, signedMessage, message };
      
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      console.log(await response.json());
    }
  }

  return (
    <div className="nav-bar">
      <div className="nav-bar-inner"> 
          <h3 className="logo">FreelanceHub</h3>

          <div className="links">
            <div className="logo-btn">Login</div>
            <div className="registration-link" ref={menuRef}>
              <div className="registration-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                Registrati
              </div>
              {isMenuOpen &&
                <div className="registration-dropdown-menu">
                  <div>Freelancer</div>
                  <div onClick={() => setShowRegistrationModal(true)}>Cliente</div>
                </div>
              }
              </div>    
          </div>
      </div>
      <Modal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSubmit={(val) => handleSignupClientClick(val)}
        title="Registrazione"
        placeholder="Inserisci la tua email o username"
        buttonText="Registrati"
      />
    </div>
  );
}

export default NavBar;