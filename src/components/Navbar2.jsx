import React, { useState, useEffect, useRef } from 'react';
import styles from '../css/Navbar.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
function Navbar({ user, team }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navLinksRef = useRef(null); 
  const menuToggleRef = useRef(null); 
  
  const entity = user || team;
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        navLinksRef.current &&
        !navLinksRef.current.contains(event.target) &&
        menuToggleRef.current &&
        !menuToggleRef.current.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className={styles.topNavbar}>
      <div className={styles.logo}>
        <i className="fa-solid fa-gamepad logo-icon"></i>
        <span>PlayPLexus</span>
      </div>

      <div
        className={styles.menuToggle}
        id="menuToggle"
        onClick={handleMenuToggle}
        ref={menuToggleRef}
      >
        <i className="fa-solid fa-bars"></i>
      </div>

      <div
        className={`${styles.navLinks} ${isMenuOpen ? styles.active : ''}`}
        id="navLinks"
        ref={navLinksRef}
      >
        
          <a href={`/NewRequestsPage/${entity?._id}`} className={styles.navLink}>
            <i className="fa-solid fa-bell"></i> <span className={styles.linkText}>New Requests</span>
          </a>
       
          
  
          <a href={`/LandPage/${entity?._id}`} className={styles.navLink}>
            <i className="fa-solid fa-house"></i> <span className={styles.linkText}>Back to Landing</span>
          </a>
        

        <a href="/logout" className={styles.navLink}>
          <i className="fa-solid fa-right-from-bracket"></i> <span className={styles.linkText}>Logout</span>
        </a>
      </div>
    </nav>
  );
}

export default Navbar;