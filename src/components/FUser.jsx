import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../css/FRequest.module.css';
import { useParams } from 'react-router-dom';

// Use environment variable for API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://playplexusbackend.onrender.com';

const MainContent = ({ userObj, teamObj, playObj, locaObj }) => {
  const token = localStorage.getItem('token');
  const userId = userObj?._id || null;
  const teamId = teamObj?._id || null;
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [profileModalUser, setProfileModalUser] = useState(null);
  const [requestModalUser, setRequestModalUser] = useState(null);
  const [requestType, setRequestType] = useState('sport');
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const [chatbotInput, setChatbotInput] = useState('');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [errorToast, setErrorToast] = useState({ show: false, message: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const usersPerPage = 6;
  const chatbotMessagesRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript || '';
        setChatbotInput(transcript);
        stopRecording();
      };
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        let errorMessage = 'Speech recognition failed. Please try again.';
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please speak clearly.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not detected. Please check your device.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone permissions in browser settings.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection and try again.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        setErrorToast({ show: true, message: errorMessage });
        setTimeout(() => setErrorToast({ show: false, message: '' }), 3000);
        stopRecording();
      };
      recognitionRef.current.onend = () => {
        stopRecording();
      };
    } else {
      setErrorToast({ show: true, message: 'Speech recognition is not supported in this browser.' });
      setTimeout(() => setErrorToast({ show: false, message: '' }), 3000);
    }
  }, []);

  // Validate props
  const playValue = typeof playObj === 'string' ? playObj : playObj?.name || 'all';
  const locaValue = typeof locaObj === 'string' ? locaObj : locaObj?.city || 'all';

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching users with:', { playValue, locaValue, userId });
      const response = await fetch(
  `${API_BASE_URL}/api/users/filter/${encodeURIComponent(playValue)}/${encodeURIComponent(locaValue)}/${userId || 'null'}`,
  {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('API Response:', data);
      const mappedUsers = Array.isArray(data) ? data.map((user) => ({
        id: user._id,
        name: user.name,
        username: user.username,
        phone: user.phone,
        bio: user.bio,
        city: user.location || 'Unknown',
        profile_picture: user.profileImage || 'https://via.placeholder.com/150',
        sports: Array.isArray(user.sports) ? user.sports.join(', ') : user.sports || 'None',
        email: user.email,
        online_games: Array.isArray(user.onlineGames) ? user.onlineGames.join(', ') : user.onlineGames || 'None',
      })) : [];
      setUsers(mappedUsers);
      setFilteredUsers(mappedUsers);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(`Failed to load users: ${err.message}`);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  }, [playValue, locaValue, userId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounce search
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleSearch = useCallback(
    debounce((query) => {
      if (!query) {
        setFilteredUsers(users);
      } else {
        const lowerQuery = query.toLowerCase();
        setFilteredUsers(users.filter((user) => user.username.toLowerCase().includes(lowerQuery)));
      }
      setCurrentPage(1);
    }, 300),
    [users]
  );

  const handleSearchInput = (e) => {
    const query = e.target.value.trim();
    setSearchQuery(query);
    handleSearch(query);
  };

  const loadMoreUsers = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const showProfile = (username) => {
    const user = filteredUsers.find((u) => u.username === username);
    if (user) {
      setProfileModalUser(user);
      document.body.classList.add('modal-open');
    }
  };

  const showRequestForm = (username) => {
    const user = filteredUsers.find((u) => u.username === username);
    if (user) {
      setRequestModalUser(user);
      document.body.classList.add('modal-open');
    }
  };

  const closeModal = () => {
    setProfileModalUser(null);
    setRequestModalUser(null);
    document.body.classList.remove('modal-open');
  };

  const handleRequestTypeToggle = (type) => {
    setRequestType(type);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    if (!data.dateTime || !data.message) {
      setErrorToast({ show: true, message: 'Date & Time and Message are required.' });
      setTimeout(() => setErrorToast({ show: false, message: '' }), 3000);
      return;
    }
    if (data.requestType === 'sport' && !data.sport) {
      setErrorToast({ show: true, message: 'Please specify a sport.' });
      setTimeout(() => setErrorToast({ show: false, message: '' }), 3000);
      return;
    }
    if (data.requestType === 'game' && !data.game) {
      setErrorToast({ show: true, message: 'Please specify a game.' });
      setTimeout(() => setErrorToast({ show: false, message: '' }), 3000);
      return;
    }

    const baseActionUrl = userObj?._id
      ? `${API_BASE_URL}/api/requests/send/${userObj._id}`
      : `${API_BASE_URL}/api/requests/send/${teamObj._id}`;
    const actionUrl = `${baseActionUrl}/${requestModalUser.id}`;

    try {
      const response = await fetch(actionUrl, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data),
});


      if (response.ok) {
        setSuccessToast(true);
        setTimeout(() => setSuccessToast(false), 3000);
        closeModal();
      } else {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to send request';
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          errorMessage = `Server error: ${response.statusText}`;
        }
        setErrorToast({ show: true, message: errorMessage });
        setTimeout(() => setErrorToast({ show: false, message: '' }), 3000);
      }
    } catch (error) {
      setErrorToast({ show: true, message: 'Network error. Please try again.' });
      setTimeout(() => setErrorToast({ show: false, message: '' }), 3000);
    }
  };

  const toggleChatbot = () => {
    setIsChatbotOpen((prev) => !prev);
    if (!isChatbotOpen && chatbotMessages.length === 0) {
      setChatbotMessages([{ type: 'bot', text: 'Hello! Welcome to PlayPLexus. How can I assist you today?', time: getCurrentTime() }]);
    }
  };

  const startRecording = () => {
    if (recognitionRef.current && !isRecording) {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (e) {
        console.error('Error starting speech recognition:', e);
        setErrorToast({ show: true, message: 'Failed to start recording. Please try again.' });
        setTimeout(() => setErrorToast({ show: false, message: '' }), 3000);
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

    const newMessage = { type: 'user', text: chatbotInput, time: getCurrentTime() };
    setChatbotMessages((prev) => [...prev, newMessage]);
    setChatbotInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatBot/ask/${userObj?._id || teamObj}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ userSpeechText: chatbotInput }),
});

      if (!response.ok) {
        setChatbotMessages((prev) => [
        ...prev,
        { type: 'bot', text: "Sorry, currently the chatbot is not designed to answer advanced queries.", time: getCurrentTime() },
      ]);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setChatbotMessages((prev) => [
        ...prev,
        { type: 'bot', text: "Sorry, currently the chatbot is not designed to answer advanced queries.", time: getCurrentTime() },
      ]);
        throw new Error('Invalid response format');
      }
      const data = await response.json();
      const botMessage = typeof data === 'object' ? { type: 'bot', text: data.text, link: data.link, time: getCurrentTime() } : { type: 'bot', text: data, time: getCurrentTime() };
      setChatbotMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setErrorToast({ show: true, message: 'Failed to send message. Please try again.' });
      setTimeout(() => setErrorToast({ show: false, message: '' }), 3000);
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (chatbotMessagesRef.current) {
      chatbotMessagesRef.current.scrollTop = chatbotMessagesRef.current.scrollHeight;
    }
  }, [chatbotMessages]);

  const renderUsers = () => {
    const start = (currentPage - 1) * usersPerPage;
    const end = start + usersPerPage;
    const usersToDisplay = filteredUsers.slice(0, end);

    if (usersToDisplay.length === 0) {
      return <p className={styles['no-users']}>No users found.</p>;
    }

    return usersToDisplay.map((user, index) => (
      <div key={user.id} className={`${styles['user-card']} ${styles[`card-${(index % 5) + 1}`]}`}>
        <div className={styles['card-bg']}></div>
        <div className={styles['card-content']}>
          <div className={styles['user-id']} style={{ display: 'none' }}>{user.id}</div>
          <div className={styles['user-header']}>
            <div className={styles['user-avatar']}>
              <img src={user.profile_picture} alt={user.username} />
            </div>
            <div className={styles['user-info']}>
              <h3>{user.username}</h3>
              <p>Player</p>
            </div>
          </div>
          <br />
          <div className={styles['user-details']}>
            <div className={styles['detail-item']}>
              <i className="fa-solid fa-envelope"></i>
              <span>{user.email}</span>
            </div>
            <div className={styles['detail-item']}>
              <i className="fa-solid fa-phone"></i>
              <span>{user.phone}</span>
            </div>
            <div className={styles['detail-item']}>
              <i className="fa-solid fa-city"></i>
              <span>{user.city}</span>
            </div>
          </div>
          <div className={styles['card-actions']}>
            <div className={styles['action-row']}>
              <button className={`${styles['action-btn']} ${styles['btn-profile']}`} onClick={() => showProfile(user.username)}>
                <i className="fa-solid fa-user"></i> See Full Profile
              </button>
              <button className={`${styles['action-btn']} ${styles['btn-request']}`} onClick={() => showRequestForm(user.username)}>
                <i className="fa-solid fa-paper-plane"></i> Send Request
              </button>
            </div>
            <div className={styles['action-centered']}>
              <a
                href={userObj?._id ? `/ChatPage/${userObj._id}/${user.id}` : `/ChatPage/${teamObj._id}/${user.id}`}
                className={`${styles['action-btn']} ${styles['btn-chat']}`}
              >
                <i className="fa-solid fa-message"></i> Start Chat
              </a>
            </div>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <main className={styles['main-content']}>
      <div className={styles['page-header']}>
        <h1>
          Find <span className={styles.highlight}>Players</span>
        </h1>
        <span className={styles['filter-item']}>
          <input
            type="text"
            id="searchFilter"
            placeholder="Search players..."
            value={searchQuery}
            onChange={handleSearchInput}
          />
        </span>
      </div>

      <div className={styles['users-container']}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Finding players near you...</p>
          </div>
        ) : error ? (
          <p className={styles['no-users']}>{error}</p>
        ) : (
          renderUsers()
        )}
      </div>

      {!loading && !error && filteredUsers.length > currentPage * usersPerPage && (
        <div className={styles['load-more-container']}>
          <button className={styles['load-more-btn']} onClick={loadMoreUsers}>
            <i className="fa-solid fa-spinner"></i> Load More Players
          </button>
        </div>
      )}

      {profileModalUser && (
        <div className={`${styles.modal} ${styles.active}`}>
          <div className={styles['modal-overlay']} onClick={closeModal}></div>
          <div className={styles['modal-content']}>
            <div className={styles['modal-close']} onClick={closeModal}>
              <i className="fa-solid fa-xmark"></i>
            </div>
            <div className={styles['profile-detail']}>
              <div className={styles['user-avatar']}>
                <img src={profileModalUser.profile_picture} alt={profileModalUser.username} />
              </div>
              <div className={styles['detail-item']}>
                <i className="fa-solid fa-user"></i>
                <h3>{profileModalUser.username}</h3>
              </div>
              {profileModalUser.bio && (
                <div className={styles['detail-item']}>
                  <i className="fa-solid fa-pencil"></i>
                  <span>{profileModalUser.bio}</span>
                </div>
              )}
              <div className={styles['detail-item']}>
                <i className="fa-solid fa-envelope"></i>
                <span>{profileModalUser.email}</span>
              </div>
              <div className={styles['detail-item']}>
                <i className="fa-solid fa-phone"></i>
                <span>{profileModalUser.phone}</span>
              </div>
              <div className={styles['detail-item']}>
                <i className="fa-solid fa-city"></i>
                <span>{profileModalUser.city}</span>
              </div>
              <div className={styles['detail-item']}>
                <i className="fa-solid fa-futbol"></i>
                <span>Sports: {profileModalUser.sports}</span>
              </div>
              <div className={styles['detail-item']}>
                <i className="fa-solid fa-gamepad"></i>
                <span>Games: {profileModalUser.online_games}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {requestModalUser && (
        <div className={`${styles.modal} ${styles.active}`}>
          <div className={styles['modal-overlay']} onClick={closeModal}></div>
          <div className={`${styles['modal-content']} ${styles['request-modal-content']}`}>
            <div className={styles['modal-close']} onClick={closeModal}>
              <i className="fa-solid fa-xmark"></i>
            </div>
            <div className={styles['request-form-container']}>
              <h2>Send Game Request</h2>
              <div className={styles['form-container']}>
                <form id="requestForm" onSubmit={handleRequestSubmit}>
                  <div className={styles['form-group']}>
                    <label htmlFor="requestType">Activity Type</label>
                    <div className={styles['toggle-container']}>
                      <div
                        className={`${styles['toggle-option']} ${requestType === 'sport' ? styles.active : ''}`}
                        onClick={() => handleRequestTypeToggle('sport')}
                      >
                        Sport
                      </div>
                      <div
                        className={`${styles['toggle-option']} ${requestType === 'game' ? styles.active : ''}`}
                        onClick={() => handleRequestTypeToggle('game')}
                      >
                        Online Game
                      </div>
                    </div>
                    <input type="hidden" id="requestType" name="requestType" value={requestType} />
                  </div>
                  <div className={`${styles['form-group']} ${requestType !== 'sport' ? styles.hidden : ''}`}>
                    <label htmlFor="sportInput">Sport</label>
                    <input type="text" id="sportInput" name="sport" placeholder="Enter a sport" />
                  </div>
                  <div className={`${styles['form-group']} ${requestType !== 'game' ? styles.hidden : ''}`}>
                    <label htmlFor="gameInput">Online Game</label>
                    <input type="text" id="gameInput" name="game" placeholder="Enter an online game" />
                  </div>
                  <div className={`${styles['form-group']} ${requestType !== 'sport' ? styles.hidden : ''}`}>
                    <label htmlFor="venue">Venue</label>
                    <input type="text" id="venue" name="venue" placeholder="Enter venue location" />
                  </div>
                  <div className={`${styles['form-group']} ${requestType !== 'game' ? styles.hidden : ''}`}>
                    <label htmlFor="platformInput">Platform</label>
                    <input
                      type="text"
                      id="platformInput"
                      name="platform"
                      placeholder="Enter platform (e.g., PC, PlayStation)"
                    />
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
                  <div className={styles['form-group']}>
                    <label htmlFor="dateTime">Date & Time</label>
                    <input type="datetime-local" id="dateTime" name="dateTime" required />
                  </div>
                  <div className={styles['form-group']}>
                    <label htmlFor="message">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      placeholder="Add a personal message..."
                      rows="3"
                      required
                    ></textarea>
                  </div>
                  <div className={styles['form-actions']}>
                    <button type="button" className={styles['btn-cancel']} onClick={closeModal}>
                      Cancel
                    </button>
                    <button type="submit" className={styles['btn-submit']}>
                      Send Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`${styles.toast} ${successToast ? styles.active : ''}`}>
        <div className={`${styles['toast-icon']} ${styles.success}`}>
          <i className="fa-solid fa-check"></i>
        </div>
        <div className={styles['toast-content']}>
          <p className={styles['toast-message']}>Request sent successfully!</p>
        </div>
        <div className={styles['toast-close']} onClick={() => setSuccessToast(false)}>
          <i className="fa-solid fa-xmark"></i>
        </div>
      </div>

      <div className={`${styles.toast} ${errorToast.show ? styles.active : ''}`}>
        <div className={`${styles['toast-icon']} ${styles.error}`}>
          <i className="fa-solid fa-xmark"></i>
        </div>
        <div className={styles['toast-content']}>
          <p className={styles['toast-message']}>{errorToast.message}</p>
        </div>
        <div className={styles['toast-close']} onClick={() => setErrorToast({ show: false, message: '' })}>
          <i className="fa-solid fa-xmark"></i>
        </div>
      </div>

      <div className={styles['chatbot-icon']} onClick={toggleChatbot}>
        <i className="fa-solid fa-robot"></i>
      </div>

      <div className={`${styles['chatbot-container']} ${isChatbotOpen ? styles.active : ''}`}>
        <div className={styles['chatbot-header']}>
          <div className={styles['chatbot-title']}>
            <i className="fa-solid fa-robot"></i>
            <span>PlayPLexus Assistant</span>
          </div>
          <div className={styles['chatbot-close']} onClick={toggleChatbot}>
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>
        <div className={styles['chatbot-messages']} ref={chatbotMessagesRef}>
          {chatbotMessages.map((msg, index) => (
            <div key={index} className={`${styles.message} ${styles[msg.type]}`}>
              {msg.text}
              {msg.link && (
                <div>
                  <a href={`${API_BASE_URL}${msg.link}`}>{msg.link}</a>
                </div>
              )}
              <span className={styles['message-time']}>{msg.time}</span>
            </div>
          ))}
        </div>
        <div className={styles['chatbot-input-container']}>
          <textarea
            id="chatbotInput"
            placeholder="Type a message..."
            rows="1"
            value={chatbotInput}
            onChange={(e) => setChatbotInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
              setTimeout(() => {
                e.target.style.height = 'auto';
                const height = Math.min(e.target.scrollHeight, 100);
                e.target.style.height = `${height}px`;
              }, 0);
            }}
          />
          <button
            className={`${styles['chatbot-record-btn']} ${isRecording ? styles.recording : ''}`}
            onClick={isRecording ? stopRecording : startRecording}
            style={{ display: recognitionRef.current ? 'block' : 'none' }}
          >
            <i className="fa-solid fa-microphone"></i>
          </button>
          <button className={styles['chatbot-send-btn']} onClick={sendMessage}>
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </main>
  );
};

export default MainContent;