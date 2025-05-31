// ProfilePage.jsx
import React from 'react';
import Navbar from './components/Navbar2'; // Your existing Navbar component
import Sidebar from './components/Sidebar'; // Your existing Sidebar component
import Profile from './components/Profile.jsx';
import './Profile.css'; // Assuming shared styles
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faGamepad, faBars, faBell, faHouse, faRightFromBracket, faChevronLeft, faTableColumns, faUsers, faTrophy, faInbox, faUser } from '@fortawesome/free-solid-svg-icons';

// Add icons to the library
library.add(faGamepad, faBars, faBell, faHouse, faRightFromBracket, faChevronLeft, faTableColumns, faUsers, faTrophy, faInbox, faUser);

const ProfilePage = ({ user, team }) => {
  return (
    <div className="page-container">
      <Navbar user={user} team={team} />
      <div className="content-container">
        <Sidebar user={user} team={team} />
        <Profile user={user} team={team} />
      </div>
    </div>
  );
};

export default ProfilePage;