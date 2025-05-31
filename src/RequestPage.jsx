import React from 'react';
import Navbar from './components/Navbar2'; // Assuming your Navbar component is in Navbar.jsx
import Sidebar from './components/Sidebar'; // Assuming your Sidebar component is in Sidebar.jsx
import RequestsPageContent from './components/Request.jsx';


function App({user, team}) {
    
   

    return (
        <>
            <Navbar user={user} team={team}/> 
            <div className="content-container">
                <Sidebar user={user} team={team} /> {/* Your existing Sidebar component */}
                <RequestsPageContent userObj={user} teamObj={team} />
            </div>
        </>
    );
}

export default App;