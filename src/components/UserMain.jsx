import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from '../css/UserMain.module.css';

const UserMain = ({ user, team }) => {
  const token = localStorage.getItem('token');
  console.log("user", user);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [requestType, setRequestType] = useState('sport');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState([]);
  const chatbotMessagesRef = useRef(null);
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  const usersPerPage = 6;
  const currentUserId = user?._id || null;
  const currentTeamId = team?._id || null;
  const activeId = currentUserId || currentTeamId;

  const requestFormRef = useRef(null);

  // Debounce function
  const debounce = (func, wait) => {
    let timeout;
    return function (...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  };

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!activeId) return;

    try {
      const response = await fetch(`https://playplexusbackend.onrender.com/api/users/allUsers/${activeId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      const fetchedUsers = data.map(u => ({
        id: u._id,
        name: u.name,
        username: u.username,
        phone: u.phone,
        bio: u.bio,
        city: u.location,
        profile_picture: u.profileImage,
        sports: Array.isArray(u.sports) ? u.sports.join(', ') : u.sports,
        email: u.email,
        online_games: Array.isArray(u.onlineGames) ? u.onlineGames.join(', ') : u.onlineGames,
      }));
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, [activeId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search query
  const filterUsers = useCallback((query) => {
    if (!query) {
      setFilteredUsers(users);
    } else {
      const lowerQuery = query.toLowerCase();
      setFilteredUsers(users.filter(u =>
        u.username.toLowerCase().includes(lowerQuery)
      ));
    }
    setCurrentPage(1);
  }, [users]);

  const debouncedFilterUsers = useCallback(debounce(filterUsers, 300), [filterUsers]);

  // Handle search input change
  const handleSearchChange = (e) => {
    debouncedFilterUsers(e.target.value.trim());
  };

  // Load more users
  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  // Show profile modal
  const showProfile = (username) => {
    const userFound = filteredUsers.find(u => u.username === username);
    if (userFound) {
      setSelectedUser(userFound);
      setIsProfileModalOpen(true);
      document.body.classList.add(styles.modalOpen);
    }
  };

  // Show request form modal
  const showRequestForm = (username) => {
    const userFound = filteredUsers.find(u => u.username === username);
    if (userFound) {
      setSelectedUser(userFound);
      setIsRequestModalOpen(true);
      document.body.classList.add(styles.modalOpen);
      if (requestFormRef.current) {
        let baseActionUrl;
        if (currentUserId) {
          baseActionUrl = `https://playplexusbackend.onrender.com/api/requests/send/${currentUserId}`;
        } else if (currentTeamId) {
          baseActionUrl = `https://playplexusbackend.onrender.com/api/requests/send/${currentTeamId}`;
        }
        requestFormRef.current.action = `${baseActionUrl}/${userFound.id}`;
      }
    }
  };

  // Close any modal
  const closeModal = (modalType) => {
    if (modalType === 'profile') {
      setIsProfileModalOpen(false);
    } else if (modalType === 'request') {
      setIsRequestModalOpen(false);
      if (requestFormRef.current) {
        requestFormRef.current.reset();
        setRequestType('sport');
      }
    }
    document.body.classList.remove(styles.modalOpen);
  };

  // Handle request form submission
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    if (!data.dateTime || !data.message) {
      setErrorMessage('Date & Time and Message are required.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }
    if (data.requestType === 'sport' && !data.sport) {
      setErrorMessage('Please specify a sport.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }
    if (data.requestType === 'game' && !data.game) {
      setErrorMessage('Please specify a game.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
      return;
    }

    try {
      const response = await fetch(form.action, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify(data),
});


      if (response.ok) {
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
        closeModal('request');
      } else {
        let errorData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
          setErrorMessage(errorData.message || 'Failed to send request');
        } else {
          setErrorMessage(`Server error: ${response.statusText}`);
        }
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      setErrorMessage('Network error. Please try again.');
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US'; // Set to English or adjust as needed

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const inputElement = document.getElementById('chatbotInput');
        if (inputElement) {
          inputElement.value = transcript;
          handleSendMessage(); // Automatically send the transcribed message
        }
        stopRecording();
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        displayMessage('Sorry, there was an error with speech recognition.', styles.bot);
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
        displayMessage('Sorry, there was an error starting speech recognition.', styles.bot);
      }
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const displayMessage = (message, senderClass) => {
    const newMessage = {
      text: typeof message === 'object' && message.text ? message.text : message,
      link: typeof message === 'object' ? message.link : null,
      sender: senderClass,
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    setChatbotMessages((prev) => [...prev, newMessage]);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    if (chatbotMessagesRef.current) {
      chatbotMessagesRef.current.scrollTop = chatbotMessagesRef.current.scrollHeight;
    }
  };

  const showTypingIndicator = () => {
    setChatbotMessages((prev) => [...prev, { id: 'typing', sender: styles.bot, isTyping: true }]);
    scrollToBottom();
  };

  const hideTypingIndicator = () => {
    setChatbotMessages((prev) => prev.filter((msg) => !msg.isTyping));
  };

  const handleSendMessage = async () => {
    const chatbotInput = document.getElementById('chatbotInput');
    if (!chatbotInput) return;

    const message = chatbotInput.value.trim();
    if (message) {
      displayMessage(message, styles.user);
      chatbotInput.value = '';
      chatbotInput.style.height = 'auto';

      showTypingIndicator();

      try {
        const response = await fetch(`https://playplexusbackend.onrender.com/api/chatBot/ask/${currentUserId || currentTeamId}`, {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ userSpeechText: message }),
});

       
        hideTypingIndicator();

         if (response.ok) {
                const data = await response.json();
                displayMessage(data.text, styles.bot); // Display text first
                if (data.link) {
                  displayMessage(data.link, styles.bot); // Then display link
                }
              } else {
                displayMessage('Sorry, currently the chatbot is not designed to answer advanced queries.', styles.bot);
              }
      } catch (error) {
        console.error('Error sending chat message:', error);
        hideTypingIndicator();
        displayMessage('Sorry, currently the chatbot is not designed to answer advanced queries.', styles.bot);
      }
    }
  };

  const handleChatbotInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
  };

  // Display welcome message when chatbot opens
  useEffect(() => {
    if (isChatbotOpen && chatbotMessages.length === 0) {
      displayMessage('Hello! Welcome to PlayPLexus. How can I assist you today?', styles.bot);
    }
  }, [isChatbotOpen]);

  return (
    <main className={styles.mainContent}>
      <div className={styles.pageHeader}>
        <h1>Find <span className={styles.highlight}>Players</span></h1>
        <span className={styles.filterItem}>
          <input
            type="text"
            id="searchFilter"
            placeholder="Search players..."
            onChange={handleSearchChange}
          />
        </span>
      </div>

      <div className={styles.usersContainer} id="usersContainer">
        {filteredUsers.length === 0 && !activeId ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Finding players near you...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <p>No users found.</p>
        ) : (
          filteredUsers.slice(0, currentPage * usersPerPage).map(u => {
            const chatLink = currentUserId
              ? `/chatPage/${currentUserId}/${u.id}`
              : `/chatPage/${currentTeamId}/${u.id}`;
            return (
              <div className={styles.userCard} key={u.id}>
                <div className={styles.cardBg}></div>
                <div className={styles.cardContent}>
                  <div className={styles.userId} style={{ display: 'none' }}>{u.id}</div>
                  <div className={styles.userHeader}>
                    <div className={styles.userAvatar}>
                      <img src={u.profile_picture} alt={u.username} />
                    </div>
                    <div className={styles.userInfo}>
                      <h3>{u.username}</h3>
                      <p>Player</p>
                    </div>
                  </div>
                  <br />
                  <div className={styles.userDetails}>
                    <div className={styles.detailItem}>
                      <i className="fa-solid fa-envelope"></i>
                      <span>{u.email}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <i className="fa-solid fa-phone"></i>
                      <span>{u.phone}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <i className="fa-solid fa-city"></i>
                      <span>{u.city}</span>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <div className={styles.actionRow}>
                      <button className={`${styles.actionBtn} ${styles.btnProfile}`} onClick={() => showProfile(u.username)}>
                        <i className="fa-solid fa-user"></i> See Full Profile
                      </button>
                      <button className={`${styles.actionBtn} ${styles.btnRequest}`} onClick={() => showRequestForm(u.username)}>
                        <i className="fa-solid fa-paper-plane"></i> Send Request
                      </button>
                    </div>
                    <div className={styles.actionCentered}>
                      <a href={chatLink} className={`${styles.actionBtn} ${styles.btnChat}`}>
                        <i className="fa-solid fa-message"></i> Start Chat
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {filteredUsers.length > currentPage * usersPerPage && (
        <div className={styles.loadMoreContainer}>
          <button id="loadMoreBtn" className={styles.loadMoreBtn} onClick={handleLoadMore}>
            <i className="fa-solid fa-spinner"></i> Load More Players
          </button>
        </div>
      )}

      {/* User Profile Modal */}
      <div className={`${styles.modal} ${isProfileModalOpen ? styles.active : ''}`} id="profileModal">
        <div className={styles.modalOverlay} onClick={() => closeModal('profile')}></div>
        <div className={styles.modalContent}>
          <div className={styles.modalClose} onClick={() => closeModal('profile')}>
            <i className="fa-solid fa-xmark"></i>
          </div>
          <div className={styles.profileDetail} id="profileDetail">
            {selectedUser && (
              <>
                <div className={styles.userAvatar}>
                  <img src={selectedUser.profile_picture} alt={selectedUser.username} />
                </div>
                <div className={styles.detailItem}>
                  <i className="fa-solid fa-user"></i>
                  <h3 className={styles.username}>{selectedUser.username}</h3>
                </div>
                {selectedUser.bio && (
                  <div className={styles.detailItem}>
                    <i className="fa-solid fa-pencil"></i>
                    <span>{selectedUser.bio}</span>
                  </div>
                )}
                <div className={styles.detailItem}>
                  <i className="fa-solid fa-envelope"></i>
                  <span>{selectedUser.email}</span>
                </div>
                <div className={styles.detailItem}>
                  <i className="fa-solid fa-phone"></i>
                  <span>{selectedUser.phone}</span>
                </div>
                <div className={styles.detailItem}>
                  <i className="fa-solid fa-city"></i>
                  <span>{selectedUser.city}</span>
                </div>
                <div className={styles.detailItem}>
                  <i className="fa-solid fa-futbol"></i>
                  <span>Sports: {selectedUser.sports}</span>
                </div>
                <div className={styles.detailItem}>
                  <i className="fa-solid fa-gamepad"></i>
                  <span>Games: {selectedUser.online_games}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Request Form Modal */}
      <div className={`${styles.modal} ${isRequestModalOpen ? styles.active : ''}`} id="requestModal">
        <div className={styles.modalOverlay} onClick={() => closeModal('request')}></div>
        <div className={`${styles.modalContent} ${styles.requestModalContent}`}>
          <div className={styles.modalClose} onClick={() => closeModal('request')}>
            <i className="fa-solid fa-xmark"></i>
          </div>
          <div className={styles.requestFormContainer}>
            <h2>Send Game Request</h2>
            <div className={styles.formContainer}>
              <form ref={requestFormRef} id="requestForm" onSubmit={handleRequestSubmit}>
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
                  <input type="hidden" id="requestType" name="requestType" value={requestType} />
                </div>

                <div className={`${styles.formGroup} ${requestType === 'game' ? styles.hidden : ''}`} id="sportSelectGroup">
                  <label htmlFor="sportInput">Sport</label>
                  <input type="text" id="sportInput" name="sport" placeholder="Enter a sport" />
                </div>

                <div className={`${styles.formGroup} ${requestType === 'sport' ? styles.hidden : ''}`} id="gameSelectGroup">
                  <label htmlFor="gameInput">Online Game</label>
                  <input type="text" id="gameInput" name="game" placeholder="Enter an online game" />
                </div>

                <div className={`${styles.formGroup} ${requestType === 'game' ? styles.hidden : ''}`} id="venueGroup">
                  <label htmlFor="venue">Venue</label>
                  <input type="text" id="venue" name="venue" placeholder="Enter venue location" />
                </div>

                <div className={`${styles.formGroup} ${requestType === 'sport' ? styles.hidden : ''}`} id="platformGroup">
                  <label htmlFor="platformInput">Platform</label>
                  <input type="text" id="platformInput" name="platform" placeholder="Enter platform (e.g., PC, PlayStation)" />
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
                  <input type="datetime-local" id="dateTime" name="dateTime" required />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" placeholder="Add a personal message..." rows="3" required></textarea>
                </div>

                <div className={styles.formActions}>
                  <button type="button" className={styles.btnCancel} onClick={() => closeModal('request')}>Cancel</button>
                  <button type="submit" className={styles.btnSubmit}>Send Request</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className={`${styles.toast} ${styles.active}`} id="successToast">
          <div className={`${styles.toastIcon} ${styles.success}`}>
            <i className="fa-solid fa-check"></i>
          </div>
          <div className={styles.toastContent}>
            <p className={styles.toastMessage}>Request sent successfully!</p>
          </div>
          <div className={styles.toastClose} onClick={() => setShowSuccessToast(false)}>
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>
      )}

      {/* Error Toast */}
      {showErrorToast && (
        <div className={`${styles.toast} ${styles.active} ${styles.error}`} id="errorToast">
          <div className={`${styles.toastIcon} ${styles.error}`}>
            <i className="fa-solid fa-xmark"></i>
          </div>
          <div className={styles.toastContent}>
            <p className={styles.toastMessage}>{errorMessage}</p>
          </div>
          <div className={styles.toastClose} onClick={() => setShowErrorToast(false)}>
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>
      )}

      {/* Chatbot Icon */}
      <div
        className={styles.chatbotIcon}
        onClick={() => {
          setIsChatbotOpen(true);
        }}
      >
        <i className="fa-solid fa-robot"></i>
      </div>

      {/* Chatbot Interface */}
      {isChatbotOpen && (
        <div className={`${styles.chatbotContainer} ${styles.active}`}>
          <div className={styles.chatbotHeader}>
            <div className={styles.chatbotTitle}>
              <i className="fa-solid fa-robot"></i>
              <span>PlayPLexus Assistant</span>
            </div>
            <div
              className={styles.chatbotClose}
              onClick={() => {
                setIsChatbotOpen(false);
                stopRecording();
              }}
            >
              <i className="fa-solid fa-xmark"></i>
            </div>
          </div>
          <div className={styles.chatbotMessages} ref={chatbotMessagesRef}>
            {chatbotMessages.map((msg, index) => {
              if (msg.isTyping) {
                return (
                  <div key="typing" className={styles.typingIndicator} id="typingIndicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                );
              }
              return (
                <div key={index} className={`${styles.message} ${msg.sender}`}>
                  <span>{msg.text}</span>
                  {msg.link && (
                    <div className={`${styles.message} ${msg.sender}`}>
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
              placeholder="Type a message..."
              rows="1"
              onKeyDown={handleChatbotInputKeyDown}
            ></textarea>
            <button
              className={`${styles.chatbotRecordBtn} ${isRecording ? styles.recording : ''}`}
              onClick={isRecording ? stopRecording : startRecording}
            >
              <i className={`fa-solid ${isRecording ? 'fa-stop' : 'fa-microphone'}`}></i>
            </button>
            <button className={styles.chatbotSendBtn} onClick={handleSendMessage}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default UserMain;