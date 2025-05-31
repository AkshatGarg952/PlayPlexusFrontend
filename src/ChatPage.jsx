// FullChatPage.jsx
import React from 'react';
import Navbar from './components/Navbar2'; 
import Sidebar from './components/Sidebar';
import ChatBox from './components/Chat';
import './Chat.css'; 

const FullChatPage = ({ user, team, sender, receiver, messages }) => {
    return (
        <>
            <Navbar user={user} team={team} />
            <div className="content-container">
                <Sidebar user={user} team={team} /> 
                <ChatBox sender={sender} receiver={receiver} initialMessages={messages} />
            </div>
           
        </>
    );
};

export default FullChatPage;