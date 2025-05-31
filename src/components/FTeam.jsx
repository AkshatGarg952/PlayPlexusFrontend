import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSpinner,
  faXmark,
  faRobot,
  faPaperPlane,
  faMicrophone,
  faStop,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import TeamCard from './TeamCard';
import styles from '../css/FTeam.module.css';

const TeamContent = ({ user, team, play, loca }) => {
  const token = localStorage.getItem('token');
  const userId = user?._id;
  const teamId = team?._id;
  const id = userId || teamId;

  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [profileModal, setProfileModal] = useState({ open: false, team: null });
  const [requestModal, setRequestModal] = useState({ open: false, team: null });
  const [toast, setToast] = useState({ open: false, message: '' });
  const [chatbotOpen, setChatbotOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesRef = useRef(null);
  const recognitionRef = useRef(null);
  const teamsPerPage = 6;

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Fetch teams
  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://playplexusbackend.onrender.com/api/teams/filter/${play || 'null'}/${loca || 'null'}/${id}`,
        { withCredentials: true }
      );
      const data = response.data.map((team) => ({
        id: team._id,
        name: team.name,
        leader: team.leader,
        phone: team.phone,
        bio: team.bio,
        city: team.location,
        logo: team.logo,
        sports: Array.isArray(team.sports) ? team.sports.join(', ') : team.sports,
        email: team.email,
        online_games: Array.isArray(team.onlineGames)
          ? team.onlineGames.join(', ')
          : team.onlineGames,
      }));
      setTeams(data);
      setFilteredTeams(data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setToast({ open: true, message: 'Error loading teams. Please try again.' });
      setTeams([]);
      setFilteredTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [id, play, loca]);

  // Filter teams
  const filterTeams = useCallback(
    debounce((query) => {
      if (!query) {
        setFilteredTeams(teams);
      } else {
        const lowerQuery = query.toLowerCase();
        setFilteredTeams(
          teams.filter(
            (team) =>
              team.name.toLowerCase().includes(lowerQuery) ||
              team.leader.toLowerCase().includes(lowerQuery) ||
              team.city.toLowerCase().includes(lowerQuery)
          )
        );
      }
      setCurrentPage(1);
    }, 300),
    [teams]
  );

  // Load more teams
  const loadMoreTeams = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Show profile modal
  const showProfile = (email) => {
    const team = filteredTeams.find((t) => t.email === email);
    setProfileModal({ open: true, team });
  };

  // Show request form modal
  const showRequestForm = (email) => {
    const team = filteredTeams.find((t) => t.email === email);
    setRequestModal({ open: true, team });
  };

  // Close modal
  const closeModal = (modal) => {
    if (modal === 'profile') setProfileModal({ open: false, team: null });
    if (modal === 'request') setRequestModal({ open: false, team: null });
  };

  // Request form handling
  const [requestType, setRequestType] = useState('sport');
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (!data.dateTime || !data.message) {
      setToast({ open: true, message: 'Date & Time and Message are required.' });
      return;
    }
    if (data.requestType === 'sport' && !data.sport) {
      setToast({ open: true, message: 'Please specify a sport.' });
      return;
    }
    if (data.requestType === 'game' && !data.game) {
      setToast({ open: true, message: 'Please specify a game.' });
      return;
    }

    try {
      const baseActionUrl = userId
        ? `/api/requests/send/${userId}`
        : `/api/requests/send/${teamId}`;
      const response = await axios.post(
  `https://playplexusbackend.onrender.com${baseActionUrl}/${requestModal.team.id}`,
  data,
  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }
);

      setToast({ open: true, message: 'Request sent successfully!' });
      closeModal('request');
    } catch (error) {
      setToast({ open: true, message: error.response?.data?.message || 'Failed to send request.' });
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setChatbotInput(transcript);
        sendMessage(); // Automatically send the transcribed message
        stopRecording();
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setMessages((prev) => [
          ...prev,
          { type: 'bot', text: 'Sorry, there was an error with speech recognition.', time: getCurrentTime() },
        ]);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Error starting speech recognition:', e);
        setMessages((prev) => [
          ...prev,
          { type: 'bot', text: 'Sorry, there was an error starting speech recognition.', time: getCurrentTime() },
        ]);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendMessage = async () => {
    if (!chatbotInput.trim()) return;
    const userMessage = { type: 'user', text: chatbotInput, time: getCurrentTime() };
    setMessages((prev) => [...prev, userMessage, { type: 'bot', isTyping: true }]);
    setChatbotInput('');
    scrollToBottom();

    try {
      const response = await axios.post(
  `https://playplexusbackend.onrender.com/api/chatBot/ask/${userId || teamId}`,
  { userSpeechText: chatbotInput },
  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }
);


      setMessages((prev) => prev.filter((msg) => !msg.isTyping)); // Remove typing indicator
      const botMessage = {
        type: 'bot',
        text: typeof response.data === 'object' ? response.data.text : response.data,
        link: typeof response.data === 'object' ? response.data.link : null,
        time: getCurrentTime(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      setMessages((prev) => prev.filter((msg) => !msg.isTyping)); // Remove typing indicator
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: 'Sorry, currently the chatbot is not designed to answer advanced queries.', time: getCurrentTime() },
      ]);
    }
    scrollToBottom();
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  };

  // Display welcome message
  useEffect(() => {
    if (chatbotOpen && messages.length === 0) {
      setMessages([{ type: 'bot', text: 'Hello! Welcome to PlayPLexus. How can I assist you today?', time: getCurrentTime() }]);
    }
  }, [chatbotOpen]);

  return (
    <>
      <main className={styles.mainContent}>
        <div className={styles.pageHeader}>
          <h1>
            Find <span className={styles.highlight}>Teams</span>
          </h1>
          <span className={styles.filterItem}>
            <input
              type="text"
              placeholder="Search teams..."
              onChange={(e) => filterTeams(e.target.value)}
            />
          </span>
        </div>
        <div className={styles.usersContainer}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Finding teams near you...</p>
            </div>
          ) : teams.length === 0 ? (
            <p>No teams found.</p>
          ) : filteredTeams.length === 0 ? (
            <p>No teams found.</p>
          ) : (
            filteredTeams.slice(0, currentPage * teamsPerPage).map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                userId={userId}
                teamId={teamId}
                showProfile={showProfile}
                showRequestForm={showRequestForm}
              />
            ))
          )}
        </div>
        {filteredTeams.length > currentPage * teamsPerPage && (
          <div className={styles.loadMoreContainer}>
            <button className={styles.loadMoreBtn} onClick={loadMoreTeams}>
              <FontAwesomeIcon icon={faSpinner} /> Load More Teams
            </button>
          </div>
        )}
      </main>

      {/* Profile Modal */}
      <div className={`${styles.modal} ${profileModal.open ? styles.active : ''}`}>
        <div className={styles.modalOverlay} onClick={() => closeModal('profile')}></div>
        <div className={styles.modalContent}>
          <div className={styles.modalClose} onClick={() => closeModal('profile')}>
            <FontAwesomeIcon icon={faXmark} />
          </div>
          {profileModal.team && (
            <div className={styles.profileDetail}>
              <div className={styles.userAvatar}>
                <img src={profileModal.team.logo} alt={profileModal.team.name} />
              </div>
              <div className={styles.detailItem}>
                <i className="fa-solid fa-user"></i>
                <h3>{profileModal.team.name}</h3>
              </div>
              {profileModal.team.bio && (
                <div className={styles.detailItem}>
                  <i className="fa-solid fa-pencil"></i>
                  <span>{profileModal.team.bio}</span>
                </div>
              )}
              <div className={styles.detailItem}>
                <i className="fa-solid fa-envelope"></i>
                <span>{profileModal.team.email}</span>
              </div>
              <div className={styles.detailItem}>
                <i className="fa-solid fa-phone"></i>
                <span>{profileModal.team.phone}</span>
              </div>
              <div className={styles.detailItem}>
                <i className="fa-solid fa-city"></i>
                <span>{profileModal.team.city}</span>
              </div>
              <div className={styles.detailItem}>
                <i className="fa-solid fa-futbol"></i>
                <span>Sports: {profileModal.team.sports}</span>
              </div>
              <div className={styles.detailItem}>
                <i className="fa-solid fa-gamepad"></i>
                <span>Games: {profileModal.team.online_games}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Request Modal */}
      <div className={`${styles.modal} ${requestModal.open ? styles.active : ''}`}>
        <div className={styles.modalOverlay} onClick={() => closeModal('request')}></div>
        <div className={`${styles.modalContent} ${styles.requestModalContent}`}>
          <div className={styles.modalClose} onClick={() => closeModal('request')}>
            <FontAwesomeIcon icon={faXmark} />
          </div>
          <div className={styles.requestFormContainer}>
            <h2>Send Game Request</h2>
            <div className={styles.formContainer}>
              <form id="requestForm" onSubmit={handleRequestSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="requestType">Activity Type</label>
                  <div className={styles.toggleContainer}>
                    <div
                      className={`${styles.toggleOption} ${requestType === 'sport' ? styles.active : ''}`}
                      onClick={() => setRequestType('sport')}
                    >
                      Sport
                    </div>
                    <div
                      className={`${styles.toggleOption} ${requestType === 'game' ? styles.active : ''}`}
                      onClick={() => setRequestType('game')}
                    >
                      Online Game
                    </div>
                  </div>
                  <input type="hidden" name="requestType" value={requestType} />
                </div>
                <div className={`${styles.formGroup} ${requestType !== 'sport' ? styles.hidden : ''}`}>
                  <label htmlFor="sportInput">Sport</label>
                  <input type="text" name="sport" placeholder="Enter a sport" />
                </div>
                <div className={`${styles.formGroup} ${requestType !== 'game' ? styles.hidden : ''}`}>
                  <label htmlFor="gameInput">Online Game</label>
                  <input type="text" name="game" placeholder="Enter an online game" />
                </div>
                <div className={`${styles.formGroup} ${requestType !== 'sport' ? styles.hidden : ''}`}>
                  <label htmlFor="venue">Venue</label>
                  <input type="text" name="venue" placeholder="Enter venue location" />
                </div>
                <div className={`${styles.formGroup} ${requestType !== 'game' ? styles.hidden : ''}`}>
                  <label htmlFor="platformInput">Platform</label>
                  <input type="text" name="platform" placeholder="Enter platform (e.g., PC, PlayStation)" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="expiryTime">Expiry Time</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input type="number" id="expiryTime" name="expiryTime" min="1" placeholder="Enter time" required />
                    <select id="expiryUnit" name="expiryUnit" required>
                      <option value="seconds">Seconds</option>
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="dateTime">Date & Time</label>
                  <input type="datetime-local" name="dateTime" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea name="message" placeholder="Add a personal message..." rows="3" required></textarea>
                </div>
                <div className={styles.formActions}>
                  <button type="button" className={styles.btnCancel} onClick={() => closeModal('request')}>
                    Cancel
                  </button>
                  <button type="submit" className={styles.btnSubmit}>
                    Send Request
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      <div className={`${styles.toast} ${toast.open ? styles.active : ''}`}>
        <div className={`${styles.toastIcon} ${styles.success}`}>
          <i className="fa-solid fa-check"></i>
        </div>
        <div className={styles.toastContent}>
          <p>{toast.message}</p>
        </div>
        <div className={styles.toastClose} onClick={() => setToast({ open: false, message: '' })}>
          <i className="fa-solid fa-xmark"></i>
        </div>
      </div>

      {/* Chatbot */}
      <div className={styles.chatbotIcon} onClick={() => setChatbotOpen(true)}>
        <i className="fa-solid fa-robot"></i>
      </div>

      <div className={`${styles.chatbotContainer} ${chatbotOpen ? styles.active : ''}`}>
        <div className={styles.chatbotHeader}>
          <div className={styles.chatbotTitle}>
            <i className="fa-solid fa-robot"></i>
            <span>PlayPLexus Assistant</span>
          </div>
          <div className={styles.chatbotClose} onClick={() => { setChatbotOpen(false); stopRecording(); }}>
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>
        <div className={styles.chatbotMessages} ref={messagesRef}>
          {messages.map((msg, index) => {
            if (msg.isTyping) {
              return (
                <div key="typing" className={styles.typingIndicator}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              );
            }
            return (
              <div key={index} className={`${styles.message} ${styles[msg.type]}`}>
                <span>{msg.text}</span>
                {msg.link && (
                  <div className={`${styles.message} ${styles[msg.type]}`}>
                    <a href={`https://playplexusbackend.onrender.com${msg.link}`}>{msg.link}</a>
                  </div>
                )}
                <span className={styles.messageTime}>{msg.time}</span>
              </div>
            );
          })}
        </div>
        <div className={styles.chatbotInputContainer}>
          <textarea
          id="chatbotInput"
            value={chatbotInput}
            onChange={(e) => setChatbotInput(e.target.value)}
            placeholder="Type a message..."
            rows="1"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
            }}
          ></textarea>
          <button
            className={`${styles.chatbotRecordBtn} ${isRecording ? styles.recording : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            style={{ display: recognitionRef.current ? 'block' : 'none' }}
          >
             <i className="fa-solid fa-microphone"></i>
          </button>
          <button className={styles.chatbotSendBtn} onClick={sendMessage}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </>
  );
};

export default TeamContent;