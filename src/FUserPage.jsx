// src/pages/FindPlayersPage.js
import React from 'react';
import { useParams } from 'react-router-dom';
import Navbar from './components/Navbar2';
import Sidebar from './components/Sidebar';
import MainContent from './components/FUser.jsx';
import './FUserPage.css';

const FindPlayersPage = ({user, team, play, loca}) => {
  
//   const { userId, teamId } = useParams();
  const userObj =user || {};
  const teamObj = team || {};
  const playObj = play || {};
  const locaObj = loca || {};

  return (
    <div>
      <Navbar user={user} team={team} />
      <div className="content-container">
        <Sidebar user={user} team={team} />
        <MainContent
          userObj={userObj}
          teamObj={teamObj}
          playObj={playObj}
          locaObj={locaObj}
        />
      </div>
    </div>
  );
};

export default FindPlayersPage;