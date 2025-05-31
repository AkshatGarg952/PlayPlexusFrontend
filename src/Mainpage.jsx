import React, { useEffect } from 'react';
import Navbar from './components/Navbar2.jsx';
import Sidebar from './components/Sidebar.jsx';
import DashboardMain from './components/Dashboard.jsx';
import styles from './Mainpage.module.css';

function Mainpage({ user, team }) {
  console.log("user", user)
  useEffect(() => {
    const handleDocumentClick = (e) => {
      const navLinks = document.getElementById('navLinks'); 
      const menuToggle = document.getElementById('menuToggle');

      if (navLinks && menuToggle && !navLinks.contains(e.target) && !menuToggle.contains(e.target) && navLinks.classList.contains('active')) {
        
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  return (
    <>
      <Navbar user={user} team={team} />
      <div className={styles.contentContainer}>
        <Sidebar user={user} team={team} />
        <DashboardMain user={user} team={team} />
      </div>
      
      
    </>
  );
}

export default Mainpage;