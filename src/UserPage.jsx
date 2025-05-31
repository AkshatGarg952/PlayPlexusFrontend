import React from 'react';
import Navbar from './components/Navbar2.jsx';
import Sidebar from './components/Sidebar.jsx';
import UserMain  from './components/UserMain.jsx';
import styles from './UserPage.module.css';



function UserPage ({user, team}) {
  console.log("user", user);
  return (
    <React.StrictMode>
      <div className={styles.app}>
        <Navbar user={user} team={team} />
        <div className={styles.contentContainer}>
          <Sidebar user={user} team={team} />
          <UserMain  user={user} team={team} />
        </div>
      </div>
    </React.StrictMode>
  );
};

export default UserPage;