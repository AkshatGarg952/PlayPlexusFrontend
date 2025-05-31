import React from 'react';
import Navbar from './components/Navbar2'; // Adjust path to your Navbar component
import Sidebar from './components/Sidebar'; // Adjust path to your Sidebar component
import TeamContent from './components/FTeam';
import './FTeam.css';
const TeamPage = ({ user, team, play, loca }) => {
  return (
    <div className="team-page">
      <Navbar user={user} team={team} />
      <div className="content-container">
        <Sidebar user={user} team={team} />
        <TeamContent user={user} team={team} play={play} loca={loca} />
      </div>
    </div>
  );
};

export default TeamPage;