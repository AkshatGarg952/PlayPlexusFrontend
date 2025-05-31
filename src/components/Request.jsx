import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
  faFutbol,
  faEye,
  faCheck,
  faTimes,
  faBan,
  faInfoCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import styles from '../css/Request.module.css';

const RequestsPageContent = ({ userObj, teamObj }) => {
  const token = localStorage.getItem('token');
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const requestsPerPage = 6;
  const [showModal, setShowModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'success', visible: false });
  const socketRef = useRef(null);

  const name = userObj?.username || teamObj?.name;
  const userId = userObj?._id || null;
  const teamId = teamObj?._id || null;

  // Memoized function to show request details
  const showRequestDetails = useCallback((requestId) => {
    const request = filteredRequests.find((r) => r.id === requestId);
    if (request) {
      setSelectedRequest(request);
      setShowModal(true);
      document.body.classList.add(styles['modal-open']);
    }
  }, [filteredRequests]);

  // Socket connection and event listeners
  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io('https://playplexusbackend.onrender.com', {
      transports: ['websocket', 'polling'],
    });

    // Set up event listeners
    const handleReceive = (m) => {
      console.log('Received event:', m);
      setFilteredRequests((prev) =>
        prev.map((req) => (req.id === m.id ? { ...req, status: m.status } : req))
      );
      
      // Update selected request if it matches the updated request
      setSelectedRequest((prevSelected) => {
        if (prevSelected?.id === m.id) {
          return { ...prevSelected, status: m.status };
        }
        return prevSelected;
      });
    };

    const handleConnect = () => {
      console.log('Socket connected');
    };

    const handleConnectError = (error) => {
      console.error('Socket connection error:', error);
    };

    // Add event listeners
    socketRef.current.on('connect', handleConnect);
    socketRef.current.on('connect_error', handleConnectError);
    socketRef.current.on('receive', handleReceive);

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect', handleConnect);
        socketRef.current.off('connect_error', handleConnectError);
        socketRef.current.off('receive', handleReceive);
        socketRef.current.disconnect();
      }
    };
  }, []); // Empty dependency array since we don't need to recreate socket connection

  const fetchRequests = async (url) => {
    setLoading(true);
    try {
      const id = userId || teamId;
      const updatedUrl = `${url}/${id}`;
      const response = await fetch(updatedUrl, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

      if (!response.ok) throw new Error('Failed to fetch requests');
      const data = await response.json();
      const formattedRequests = data.map((request) => ({
        id: request._id,
        sender: request.senderName,
        message: request.message,
        status: request.status,
        date: request.date,
        seen: request.seen,
        activity: request.sport || request.game,
      }));
      setRequests(formattedRequests);
      setFilteredRequests(formattedRequests);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setFilteredRequests([]);
      showToast('Error loading requests. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle request actions
  const handleRequestAction = async (requestId, action) => {
    try {
      const response = await fetch(`https://playplexusbackend.onrender.com/api/requests/update/${requestId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ status: action }),
});

      if (!response.ok) throw new Error(`Failed to ${action} request`);
      const updatedRequest = await response.json();

      setFilteredRequests((prev) =>
        prev.map((req) => (req.id === requestId ? { ...req, status: action } : req))
      );

      // Emit socket event
      if (socketRef.current) {
        socketRef.current.emit('requestAction', { action, requestId });
      }
      
      showToast(`Request ${action} successfully!`);
    } catch (error) {
      console.error(`Error ${action} request:`, error);
      showToast(`Failed to ${action} request. Please try again.`, 'error');
    }
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((prev) => ({ ...prev, visible: false })), 3000);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    document.body.classList.remove(styles['modal-open']);
  };

  // Display requests
  const displayRequests = () => {
    const start = (currentPage - 1) * requestsPerPage;
    const end = start + requestsPerPage;
    const requestsToDisplay = filteredRequests.slice(0, end);

    if (requestsToDisplay.length === 0) {
      return <p className={styles['no-requests']}>No requests found.</p>;
    }

    return requestsToDisplay.map((request) => {
      const isReceiver = request.sender !== name;
      const isSender = request.sender === name;
      const status = request.status.toLowerCase();
      const showActionButtons = isReceiver && status === 'pending';
      const accepted1 = isReceiver && status === 'accepted';
      const rejected1 = isReceiver && status === 'rejected';
      const expired1 = isReceiver && status === 'expired';
      const cancelled1 = isReceiver && status === 'cancelled';
      const showCancelButton = isSender && status === 'pending';
      const accepted2 = isSender && status === 'accepted';
      const rejected2 = isSender && status === 'rejected';
      const expired2 = isSender && status === 'expired';
      const cancelled2 = isSender && status === 'cancelled';

      return (
        <div className={styles['request-card']} key={request.id} data-request-id={request.id}>
          <div className={styles['card-bg']}></div>
          <div className={styles['card-content']}>
            <div className={styles['request-header']}>
              <div className={styles['request-info']}>
                <h3>{request.sender}</h3>
              </div>
              <span className={`${styles.status} ${styles[status]}`}>{request.status}</span>
            </div>
            <div className={styles['request-info']}>
              <p>
                <FontAwesomeIcon icon={faCalendar} /> {request.date}
              </p>
              <p>
                <FontAwesomeIcon icon={faFutbol} /> {request.activity}
              </p>
            </div>
            <div className={styles['request-actions']}>
              <div className={styles['action-row']}>
                <button
                  className={`${styles['action-btn']} ${styles['btn-profile']}`}
                  onClick={() => showRequestDetails(request.id)}
                >
                  <FontAwesomeIcon icon={faEye} /> View Details
                </button>
              </div>
              {showActionButtons && (
                <div className={`${styles['action-row']} ${styles['action-buttons']}`} id="both">
                  <button
                    className={`${styles['action-btn']} ${styles['btn-accept']}`}
                    onClick={() => handleRequestAction(request.id, 'accepted')}
                  >
                    <FontAwesomeIcon icon={faCheck} /> Accept
                  </button>
                  <button
                    className={`${styles['action-btn']} ${styles['btn-reject']}`}
                    onClick={() => handleRequestAction(request.id, 'rejected')}
                  >
                    <FontAwesomeIcon icon={faTimes} /> Reject
                  </button>
                </div>
              )}
              {accepted1 && (
                <div className={`${styles['action-row']} ${styles['status-button']}`}>
                  <button className={`${styles['action-btn']} ${styles['btn-accept']}`} disabled>
                    <FontAwesomeIcon icon={faInfoCircle} /> {request.status}
                  </button>
                </div>
              )}
              {rejected1 && (
                <div className={`${styles['action-row']} ${styles['status-button']}`}>
                  <button className={`${styles['action-btn']} ${styles['btn-reject']}`} disabled>
                    <FontAwesomeIcon icon={faInfoCircle} /> {request.status}
                  </button>
                </div>
              )}
              {cancelled1 && (
                <div className={`${styles['action-row']} ${styles['status-button']}`}>
                  <button className={`${styles['action-btn']} ${styles['btn-status']}`} disabled>
                    <FontAwesomeIcon icon={faInfoCircle} /> {request.status}
                  </button>
                </div>
              )}
              {expired1 && (
                <div className={`${styles['action-row']} ${styles['status-button']}`}>
                  <button className={`${styles['action-btn']} ${styles['btn-status']}`} disabled>
                    <FontAwesomeIcon icon={faInfoCircle} /> {request.status}
                  </button>
                </div>
              )}
              {showCancelButton && (
                <div className={`${styles['action-row']} ${styles['cancel-button']}`} id="cancell">
                  <button
                    className={`${styles['action-btn']} ${styles['btn-cancel']}`}
                    onClick={() => handleRequestAction(request.id, 'cancelled')}
                  >
                    <FontAwesomeIcon icon={faBan} /> Cancel Request
                  </button>
                </div>
              )}
              {accepted2 && (
                <div className={`${styles['action-row']} ${styles['status-button']}`}>
                  <button className={`${styles['action-btn']} ${styles['btn-accept']}`} disabled>
                    <FontAwesomeIcon icon={faInfoCircle} /> {request.status}
                  </button>
                </div>
              )}
              {rejected2 && (
                <div className={`${styles['action-row']} ${styles['status-button']}`}>
                  <button className={`${styles['action-btn']} ${styles['btn-reject']}`} disabled>
                    <FontAwesomeIcon icon={faInfoCircle} /> {request.status}
                  </button>
                </div>
              )}
              {cancelled2 && (
                <div className={`${styles['action-row']} ${styles['status-button']}`}>
                  <button className={`${styles['action-btn']} ${styles['btn-status']}`} disabled>
                    <FontAwesomeIcon icon={faInfoCircle} /> {request.status}
                  </button>
                </div>
              )}
              {expired2 && (
                <div className={`${styles['action-row']} ${styles['status-button']}`}>
                  <button className={`${styles['action-btn']} ${styles['btn-status']}`} disabled>
                    <FontAwesomeIcon icon={faInfoCircle} /> {request.status}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    });
  };

  // Update load more button visibility
  const updateLoadMoreButton = () => {
    return filteredRequests.length > currentPage * requestsPerPage;
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const selectedValue = e.target.value;
    let url;
    if (selectedValue === 'All Sended') {
      url = `https://playplexusbackend.onrender.com/api/requests/sended`;
    } else if (selectedValue === 'All Received') {
      url = `https://playplexusbackend.onrender.com/api/requests/received`;
    } else {
      url = `https://playplexusbackend.onrender.com/api/requests/details`;
    }
    fetchRequests(url);
  };

  // Load more requests
  const loadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  // Initial fetch
  useEffect(() => {
    fetchRequests(`https://playplexusbackend.onrender.com/api/requests/details`);
  }, [userId, teamId]); // Added dependencies for when user/team changes

  return (
    <>
      <main className={styles['main-content']}>
        <div className={styles['page-header']}>
          <h1>
            Find <span className={styles.highlight}>Requests</span>
          </h1>
          <span className={styles['filter-item']}>
            <select id="sportFilter" onChange={handleFilterChange}>
              <option value="">All Requests</option>
              <option value="All Sended">All Sended Requests</option>
              <option value="All Received">All Received Requests</option>
            </select>
          </span>
        </div>
        <div className={styles['users-container']} id="usersContainer">
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Finding requests...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <p className={styles['no-requests']}>No requests found.</p>
          ) : (
            displayRequests()
          )}
        </div>
        <div className={styles['load-more-container']}>
          <button
            id="loadMoreBtn"
            className={styles['load-more-btn']}
            onClick={loadMore}
            style={{ display: updateLoadMoreButton() ? 'block' : 'none' }}
          >
            <FontAwesomeIcon icon={faSpinner} /> Load More Requests
          </button>
        </div>
      </main>

      {/* Request Details Modal */}
      <div className={`${styles.modal} ${showModal ? styles.active : ''}`} id="requestDetailsModal">
        <div
          className={styles['modal-overlay']}
          id="requestDetailsModalOverlay"
          onClick={closeModal}
        ></div>
        <div className={styles['modal-content']}>
          <div className={styles['modal-close']} id="requestDetailsModalClose" onClick={closeModal}>
            <FontAwesomeIcon icon={faTimes} />
          </div>
          <div className={styles['request-detail']} id="requestDetail">
            {selectedRequest && (
              <>
                <h3>{selectedRequest.sender}</h3>
                {(selectedRequest.sender !== name &&
                  selectedRequest.status.toLowerCase() === 'pending') && (
                  <span
                    className={`${styles.status} ${styles[selectedRequest.status.toLowerCase()]}`}
                  >
                    {selectedRequest.status}
                  </span>
                )}
                {(selectedRequest.sender !== name &&
                  selectedRequest.status.toLowerCase() === 'accepted') && (
                  <span
                    className={`${styles.status} ${styles[selectedRequest.status.toLowerCase()]}`}
                  >
                    You have {selectedRequest.status} the request!
                  </span>
                )}
                {(selectedRequest.sender !== name &&
                  selectedRequest.status.toLowerCase() === 'rejected') && (
                  <span
                    className={`${styles.status} ${styles[selectedRequest.status.toLowerCase()]}`}
                  >
                    You have {selectedRequest.status} the request!
                  </span>
                )}
                {(selectedRequest.sender !== name &&
                  selectedRequest.status.toLowerCase() === 'expired') && (
                  <span
                    className={`${styles.status} ${styles[selectedRequest.status.toLowerCase()]}`}
                  >
                    The Request has been {selectedRequest.status}!
                  </span>
                )}
                {(selectedRequest.sender !== name &&
                  selectedRequest.status.toLowerCase() === 'cancelled') && (
                  <span
                    className={`${styles.status} ${styles[selectedRequest.status.toLowerCase()]}`}
                  >
                    The Request has been {selectedRequest.status}!
                  </span>
                )}
                {(selectedRequest.sender === name &&
                  selectedRequest.status.toLowerCase() === 'pending') && (
                  <span
                    className={`${styles.status} ${styles[selectedRequest.status.toLowerCase()]}`}
                  >
                    Your Request is still {selectedRequest.status}!
                  </span>
                )}
                {(selectedRequest.sender === name &&
                  selectedRequest.status.toLowerCase() === 'accepted') && (
                  <span
                    className={`${styles.status} ${styles[selectedRequest.status.toLowerCase()]}`}
                  >
                    Your Request has been {selectedRequest.status} by{' '}
                    {selectedRequest.receiverName}!
                  </span>
                )}
                {(selectedRequest.sender === name &&
                  selectedRequest.status.toLowerCase() === 'rejected') && (
                  <span
                    className={`${styles.status} ${styles[selectedRequest.status.toLowerCase()]}`}
                  >
                    Your Request has been {selectedRequest.status}!
                  </span>
                )}
                {(selectedRequest.sender === name &&
                  selectedRequest.status.toLowerCase() === 'expired') && (
                  <span
                    className={`${styles.status} ${styles[selectedRequest.status.toLowerCase()]}`}
                  >
                    Your Request has been {selectedRequest.status}!
                  </span>
                )}
                {(selectedRequest.sender === name &&
                  selectedRequest.status.toLowerCase() === 'cancelled') && (
                  <span
                    className={`${styles.status} ${styles[selectedRequest.status.toLowerCase()]}`}
                  >
                    You have {selectedRequest.status} the request!
                  </span>
                )}
                <p>
                  <FontAwesomeIcon icon={faCalendar} /> Date: {selectedRequest.date}
                </p>
                <p>
                  <FontAwesomeIcon icon={faFutbol} /> Activity: {selectedRequest.activity}
                </p>
                <div className={styles.message}>
                  <p>
                    <strong>Message:</strong> {selectedRequest.message}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Success Toast */}
      <div className={`${styles.toast} ${toast.visible ? styles.active : ''}`} id="successToast">
        <div className={`${styles['toast-icon']} ${styles[toast.type]}`}>
          <FontAwesomeIcon icon={toast.type === 'success' ? faCheck : faTimes} />
        </div>
        <div className={styles['toast-content']}>
          <p className={styles['toast-message']}>{toast.message}</p>
        </div>
        <div
          className={styles['toast-close']}
          onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
        >
          <FontAwesomeIcon icon={faTimes} />
        </div>
      </div>
    </>
  );
};

export default RequestsPageContent;