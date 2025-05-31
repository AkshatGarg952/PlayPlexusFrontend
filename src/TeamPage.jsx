import React from 'react';
// Assuming you have Navbar.jsx and Sidebar.jsx
import Navbar from './components/Navbar2';
import Sidebar from './components/Sidebar';
import TeamMain from './components/TeamMain';
import './App.css'; // For overall layout and global styles if any

function TeamPage({user, team}) {
    // You might manage sidebar/navbar active states here or within their own components
    
    return (
        <div className="app-container"> {/* This can be your new root container */}
            <Navbar user={user} team={team} /> 
            <div className="content-container">
                <Sidebar user={user} team={team} />
                <TeamMain  user={user} team={team}/>
            </div>
        </div>
    );
}

export default TeamPage;