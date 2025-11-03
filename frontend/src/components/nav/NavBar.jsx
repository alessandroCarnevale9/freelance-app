import "./NavBar.css";

const NavBar = () => {
  return (
    <div className="nav-bar">
      <div className="nav-bar-inner"> 
          <h3 className="logo">FreelanceHub</h3>

          <div className="links">
            <a href="">Login</a>
            <a href="">Registrati</a>
          </div>
      </div>
      
    </div>
  );
}

export default NavBar;