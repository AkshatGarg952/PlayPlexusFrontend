import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import styles from '../css/NewRequest.module.css'; 
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCalendar,
} from '@fortawesome/free-solid-svg-icons';

const userObj = window.userObj || { username: 'CurrentUser', _id: 'user123' };
const teamObj = window.teamObj || { name: 'CurrentTeam', _id: 'team456' };


const socket = io('https://playplexusbackend.onrender.com', {
  transports: ['websocket', 'polling'],
});

const Requests = ({user, team}) => {
  const token = localStorage.getItem('token');
    const userObj = user || null;
const teamObj = team || null;

const name = userObj ? userObj.username : teamObj.name

const userId = userObj ? userObj._id : null;
const teamId = teamObj ? teamObj._id : null;
    const [requests, setRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [toast, setToast] = useState({ message: '', type: 'success', active: false });

    const requestsPerPage = 6;

    const showToast = useCallback((message, type = 'success') => {
        setToast({ message, type, active: true });
        setTimeout(() => {
            setToast(prev => ({ ...prev, active: false }));
        }, 3000);
    }, []);

    // Fetch requests
    const fetchRequests = useCallback(async () => {
        try {
            const id = userId || teamId;
            const url = `https://playplexusbackend.onrender.com/api/requests/newdetails/${id}`; // Corrected URL
            const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

            if (!response.ok) throw new Error('Failed to fetch requests');
            const data = await response.json();
            
            const fetchedRequests = data.map((request) => ({
                id: request._id,
                sender: request.senderName,
                receiverName: request.receiverName, // Assuming this is available for accepted2 status
                message: request.message,
                status: request.status,
                date: request.date,
                seen: request.seen,
                activity: request.sport || request.game
            }));
            setRequests(fetchedRequests);
            setFilteredRequests(fetchedRequests);
            setCurrentPage(1); // Reset to first page on new fetch
        } catch (error) {
            console.error('Error fetching requests:', error);
            // Optionally, display an error message in the UI
        }
    }, []);

    useEffect(() => {
        fetchRequests();

        socket.on('receive', (m) => {
            console.log('Received event:', m);

            setFilteredRequests(prevFilteredRequests => {
                const updated = prevFilteredRequests.map(req =>
                    req.id === m.id ? { ...req, status: m.status } : req
                );
                return updated;
            });

            // Update the selected request in the modal if it's open and matches
            setSelectedRequest(prevSelected => {
                if (prevSelected && prevSelected.id === m.id) {
                    return { ...prevSelected, status: m.status };
                }
                return prevSelected;
            });
        });

        // Cleanup on unmount
        return () => {
            socket.off('receive');
        };
    }, [fetchRequests]);


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
        socket.emit('requestAction', { action, requestId });
      showToast(`Request ${action} successfully!`);
      
    } catch (error) {
      console.error(`Error ${action} request:`, error);
      showToast(`Failed to ${action} request. Please try again.`, 'error');
    }
  };
    const acceptR = (requestId) => {
        handleRequestAction(requestId, 'accepted');
    };

    const rejectR = (requestId) => {
        handleRequestAction(requestId, 'rejected');
    };

    const cancelR = (requestId) => {
        handleRequestAction(requestId, 'cancelled');
    };

    const showRequestDetails = (requestId) => {
        const request = filteredRequests.find(r => r.id === requestId);
        if (!request) return;

        setSelectedRequest(request);
        setIsModalOpen(true);
        document.body.classList.add(styles['modal-open']); // Add class to body
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        document.body.classList.remove(styles['modal-open']);
    };

    const loadMoreRequests = () => {
        setCurrentPage(prevPage => prevPage + 1);
    };

    const displayedRequests = filteredRequests.slice(0, currentPage * requestsPerPage);
    const hasMoreRequests = filteredRequests.length > currentPage * requestsPerPage;


    return (
        <div className={styles['main-content']}>
            <div className={styles['page-header']}>
                <h1>Your <span className={styles.highlight}>Requests</span></h1>
                <div className={styles['filter-item']}>
                    <input type="text" placeholder="Search requests..." />
                </div>
            </div>

            <div className={styles['users-container']}>
                {displayedRequests.length === 0 ? (
                    <p>No requests found.</p>
                ) : (
                    displayedRequests.map(request => {
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
                                        <i className="fa-solid fa-futbol"></i> {request.activity}
                                      </p>
                                    </div>
                                    <div className={styles['request-actions']}>
                                      <div className={styles['action-row']}>
                                        <button
                                          className={`${styles['action-btn']} ${styles['btn-profile']}`}
                                          onClick={() => showRequestDetails(request.id)}
                                        >
                                          <i className="fa-solid fa-eye"></i> View Details
                                        </button>
                                      </div>
                                      {showActionButtons && (
                                        <div className={`${styles['action-row']} ${styles['action-buttons']}`} id="both">
                                          <button
                                            className={`${styles['action-btn']} ${styles['btn-accept']}`}
                                            onClick={() => handleRequestAction(request.id, 'accepted')}
                                          >
                                            <i className="fa-solid fa-check"></i> Accept
                                          </button>
                                          <button
                                            className={`${styles['action-btn']} ${styles['btn-reject']}`}
                                            onClick={() => handleRequestAction(request.id, 'rejected')}
                                          >
                                            <i className="fa-solid fa-times"></i> Reject
                                          </button>
                                        </div>
                                      )}
                                      {accepted1 && (
                                        <div className={`${styles['action-row']} ${styles['status-button']}`}>
                                          <button className={`${styles['action-btn']} ${styles['btn-accept']}`} disabled>
                                            <i className="fa-solid fa-info-circle"></i> {request.status}
                                          </button>
                                        </div>
                                      )}
                                      {rejected1 && (
                                        <div className={`${styles['action-row']} ${styles['status-button']}`}>
                                          <button className={`${styles['action-btn']} ${styles['btn-reject']}`} disabled>
                                            <i className="fa-solid fa-info-circle"></i> {request.status}
                                          </button>
                                        </div>
                                      )}
                                      {cancelled1 && (
                                        <div className={`${styles['action-row']} ${styles['status-button']}`}>
                                          <button className={`${styles['action-btn']} ${styles['btn-status']}`} disabled>
                                            <i className="fa-solid fa-info-circle"></i> {request.status}
                                          </button>
                                        </div>
                                      )}
                                      {expired1 && (
                                        <div className={`${styles['action-row']} ${styles['status-button']}`}>
                                          <button className={`${styles['action-btn']} ${styles['btn-status']}`} disabled>
                                            <i className="fa-solid fa-info-circle"></i> {request.status}
                                          </button>
                                        </div>
                                      )}
                                      {showCancelButton && (
                                        <div className={`${styles['action-row']} ${styles['cancel-button']}`} id="cancell">
                                          <button
                                            className={`${styles['action-btn']} ${styles['btn-cancel']}`}
                                            onClick={() => handleRequestAction(request.id, 'cancelled')}
                                          >
                                            <i className="fa-solid fa-ban"></i> Cancel Request
                                          </button>
                                        </div>
                                      )}
                                      {accepted2 && (
                                        <div className={`${styles['action-row']} ${styles['status-button']}`}>
                                          <button className={`${styles['action-btn']} ${styles['btn-accept']}`} disabled>
                                            <i className="fa-solid fa-info-circle"></i> {request.status}
                                          </button>
                                        </div>
                                      )}
                                      {rejected2 && (
                                        <div className={`${styles['action-row']} ${styles['status-button']}`}>
                                          <button className={`${styles['action-btn']} ${styles['btn-reject']}`} disabled>
                                            <i className="fa-solid fa-info-circle"></i> {request.status}
                                          </button>
                                        </div>
                                      )}
                                      {cancelled2 && (
                                        <div className={`${styles['action-row']} ${styles['status-button']}`}>
                                          <button className={`${styles['action-btn']} ${styles['btn-status']}`} disabled>
                                            <i className="fa-solid fa-info-circle"></i> {request.status}
                                          </button>
                                        </div>
                                      )}
                                      {expired2 && (
                                        <div className={`${styles['action-row']} ${styles['status-button']}`}>
                                          <button className={`${styles['action-btn']} ${styles['btn-status']}`} disabled>
                                            <i className="fa-solid fa-info-circle"></i> {request.status}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                    })
                )}
            </div>

            {hasMoreRequests && (
                <div className={styles['load-more-container']}>
                    <button className={styles['load-more-btn']} onClick={loadMoreRequests}>
                        <i className="fa-solid fa-plus"></i> Load More
                    </button>
                </div>
            )}

            {/* Request Details Modal */}
            <div id="requestDetailsModal" className={`${styles.modal} ${isModalOpen ? styles.active : ''}`}>
                <div className={styles['modal-overlay']} onClick={closeModal}></div>
                <div className={styles['modal-content']}>
                    <span className={styles['modal-close']} onClick={closeModal}>&times;</span>
                    {selectedRequest && (
                        <div id="requestDetail" className={styles['request-detail']}>
                            <h3>{selectedRequest.sender}</h3>
                            <span className={`${styles.status} ${styles[selectedRequest.status.toLowerCase()]}`}>
                                {selectedRequest.status.toLowerCase() === 'pending' && (selectedRequest.sender === name ? `Your Request is still ${selectedRequest.status}!` : selectedRequest.status)}
                                {selectedRequest.status.toLowerCase() === 'accepted' && (selectedRequest.sender === name ? `Your Request has been ${selectedRequest.status} by ${selectedRequest.receiverName}!` : `You have ${selectedRequest.status} the request!`)}
                                {selectedRequest.status.toLowerCase() === 'rejected' && (selectedRequest.sender === name ? `Your Request has been ${selectedRequest.status}!` : `You have ${selectedRequest.status} the request!`)}
                                {selectedRequest.status.toLowerCase() === 'cancelled' && (selectedRequest.sender === name ? `You have ${selectedRequest.status} the request!` : `The Request has been ${selectedRequest.status}!`)}
                                {selectedRequest.status.toLowerCase() === 'expired' && `The Request has been ${selectedRequest.status}!`}
                            </span>
                            <p><i className="fa-solid fa-calendar"></i> Date: {selectedRequest.date}</p>
                            <p><i className="fa-solid fa-futbol"></i> Activity: {selectedRequest.activity}</p>
                            <div className={styles.message}>
                                <p><strong>Message:</strong> {selectedRequest.message}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            <div id="successToast" className={`${styles.toast} ${toast.active ? styles.active : ''}`}>
                <div className={`${styles['toast-icon']} ${toast.type === 'success' ? styles.success : ''}`}>
                    <i className={toast.type === 'success' ? 'fa-solid fa-check' : 'fa-solid fa-exclamation'}></i>
                </div>
                <div className={styles['toast-content']}>
                    <p className={styles['toast-message']}>{toast.message}</p>
                </div>
                <span className={styles['toast-close']} onClick={() => setToast(prev => ({ ...prev, active: false }))}>&times;</span>
            </div>
        </div>
    );
};

export default Requests;