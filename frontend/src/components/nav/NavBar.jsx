import "./NavBar.css";
import {useState, useRef, useEffect} from "react";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                  <div>Cliente</div>
                </div>
              }
              </div>    
          </div>
      </div>
      
    </div>
  );
}

export default NavBar;