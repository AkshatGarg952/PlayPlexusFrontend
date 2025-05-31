import React, { useState } from 'react';
import { useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faTableColumns, faUsers, faTrophy, faInbox, faUser } from '@fortawesome/free-solid-svg-icons';
import styles from '../css/Sidebar.module.css';

const Sidebar = ({ user, team }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const entity = user || team;
  const isUser = !!user;

  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      <div className={styles.sidebarToggle} onClick={toggleSidebar}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </div>
      <div className={styles.sidebarContent}>
        <div className={styles.sidebarHeader}>
          <div className={styles.avatar}>
            <img src={entity?.profileImage || entity?.logo} alt={entity?.name} />
          </div>
          <div className={styles.userInfo}>
            <h3>{entity?.name}</h3>
            <p>{isUser ? entity?.username : entity?.leader}</p>
          </div>
        </div>
        <ul className={styles.sidebarMenu}>
          <li className={currentPath === `/MainPage/${entity?._id}` ? styles.active : ""}>
            <Link
              to={`/MainPage/${entity?._id}`}
            >
              <FontAwesomeIcon icon={faTableColumns} />
              <span className={styles.menuText}>Dashboard</span>
            </Link>
          </li>
          <li className={currentPath === `/UserPage/${entity?._id}` ? styles.active : ""}>
            <Link to={`/UserPage/${entity?._id}`}>
              <FontAwesomeIcon icon={faUsers} />
              <span className={styles.menuText}>All Players</span>
            </Link>
          </li>
          <li className={currentPath === `/TeamPage/${entity?._id}` ? styles.active : ""}>
            <Link to={`/TeamPage/${entity?._id}`}>
              <FontAwesomeIcon icon={faTrophy} />
              <span className={styles.menuText}>All Teams</span>
            </Link>
          </li>
          <li className={currentPath === `/AllRequestsPage/${entity?._id}` ? styles.active : ""}>
            <Link to={`/AllRequestsPage/${entity?._id}`}>
              <FontAwesomeIcon icon={faInbox} />
              <span className={styles.menuText}>All Requests</span>
            </Link>
          </li>
          <li className={currentPath === `/ProfilePage/${entity?._id}` ? styles.active : ""}>
            <Link to={`/ProfilePage/${entity?._id}`}>
              <FontAwesomeIcon icon={faUser} />
              <span className={styles.menuText}>My Profile</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;