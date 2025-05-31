import React from 'react';
import Navbar from './components/Navbar2'; // Assuming your Navbar component is in Navbar.jsx
import Sidebar from './components/Sidebar'; // Assuming your Sidebar component is in Sidebar.jsx
import Requests from './components/NRequest';
import styles from './css/NewRequest.module.css'

const FinalRequestPage = ({user, team}) => {
    return (
        <div className={styles.appContainer}> {/* A general container for the whole app */}
            <Navbar user={user} team={team} /> {/* Your Navbar component */}
            <div className={styles['content-container']}>
                <Sidebar user={user} team={team}/> 
                <Requests user={user} team={team} />
            </div>
           
        </div>
    );
};

export default FinalRequestPage;