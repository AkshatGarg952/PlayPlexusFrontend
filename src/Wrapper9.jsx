import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import FullChatPage from './ChatPage.jsx';

const Wrapper9 = () => {
  const token = localStorage.getItem('token');
  const { sId, rId } = useParams();
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [sender, setSender] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const [messages, setMessages] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserOrTeam = async () => {
    
      try {
        setLoading(true);
        setError(null);

        
       const userResponse = await fetch(`https://playplexusbackend.onrender.com/api/users/details/${sId}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
});

        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log(userData);
          setUser(userData);
          setSender(userData);
          setTeam(null);
        } else {
          
          const teamResponse = await fetch(`https://playplexusbackend.onrender.com/api/teams/details/${sId}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
});

          
          if (teamResponse.ok) {
            const teamData = await teamResponse.json();
            setTeam(teamData);
            setSender(teamData);
            setUser(null);
          } else {
            
            setError('User or team not found');
          }
        }

        const receiverResponse1 = await fetch(`https://playplexusbackend.onrender.com/api/users/details/${rId}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
});

        
        if (receiverResponse1 .ok) {
          const userData = await receiverResponse1.json();
        
          setReceiver(userData);
          
        } else {
          
          const receiverResponse2 = await fetch(`https://playplexusbackend.onrender.com/api/teams/details/${rId}`, {
 method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
});

          
          if (receiverResponse2.ok) {
            const teamData = await receiverResponse2.json();
            setReceiver(teamData);
          
          } else {
            
            setError('User or team not found');
          }
        }

        const messages = await fetch(`https://playplexusbackend.onrender.com/api/chats/fetch/${sId}/${rId}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
});

        if (messages.ok) {
            const m = await messages.json();
            setMessages(m);
          
          } else {
            
            setError('User or team not found');
          }
        


      } catch (err) {
        console.error('Error fetching user/team:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrTeam();

    // console.log('x', user);
    // console.log('x', team);
    // console.log('x', sender);
    // console.log('x', receiver);
  }, [sId, rId]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'red'
      }}>
        Error: {error}
      </div>
    );
  }

  return <FullChatPage user={user} team={team} sender={sender} receiver={receiver} messages={messages} />;
};

export default Wrapper9;