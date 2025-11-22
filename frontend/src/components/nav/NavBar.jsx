import "./NavBar.css";
import { HamburgerMenu, CrossIcon } from "@icons";
import { useState, useRef, useEffect } from "react";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpenHamMenu, setIsOpenHamMenu] = useState(false);

  const menuRef = useRef(null);

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

  return (
    <div className="nav-bar">
      <div className="nav-bar-inner">
        <h3 className="logo">FreelanceHub</h3>

        <div className="links">
          <div className="logo-btn">Login</div>
          <div className="registration-link" ref={menuRef}>
            <div
              className="registration-btn"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              Registrati
            </div>
            {isMenuOpen && (
              <div className="registration-dropdown-menu">
                <div>Freelancer</div>
                <div>Cliente</div>
              </div>
            )}
          </div>
        </div>

        {/*Se il menu è chiuso, allora... */}
        {!isOpenHamMenu && (
          <div
            className="hamburger-open"
            onClick={() => setIsOpenHamMenu(true)}
          >
            <HamburgerMenu />
          </div>
        )}

        {/*Altrimenti se il menu è aperto, allora... */}
        {isOpenHamMenu && (
          <div
            className="hamburger-close"
            onClick={() => setIsOpenHamMenu(false)}
          >
            <CrossIcon width="25" height="25" fill="#D5D5D5" />
          </div>
        )}

        {/*Se il menu è aperto, mostro i link per mobile */}
        {isOpenHamMenu && (
          <div className="mobile-links">
            <div className="logo-btn">Login</div>
            <div className="registration">
              <div
                className="registration-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                Registrati
              </div>
              {isMenuOpen && (
                <div className="registration-dropdown-menu">
                  <div>Freelancer</div>
                  <div>Cliente</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NavBar;
