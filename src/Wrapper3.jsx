import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import TeamPage from './TeamPage';

const Wrapper2 = () => {
  const token = localStorage.getItem('token');
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserOrTeam = async () => {
      if (!id) {
        setError('No ID provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        
        const userResponse = await fetch(`https://playplexusbackend.onrender.com/api/users/details/${id}`, {
 method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
});

        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
          setTeam(null);
        } else {
          
         const teamResponse = await fetch(`https://playplexusbackend.onrender.com/api/teams/details/${id}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }
});

          
          if (teamResponse.ok) {
            const teamData = await teamResponse.json();
            setTeam(teamData);
            setUser(null);
          } else {
            
            setError('User or team not found');
          }
        }

      } catch (err) {
        console.error('Error fetching user/team:', err);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserOrTeam();
  }, [id]);

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

  return <TeamPage user={user} team={team} />;
};

export default Wrapper2;