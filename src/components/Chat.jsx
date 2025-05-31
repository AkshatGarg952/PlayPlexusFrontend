// ChatBox.jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';


const ChatBox = ({ sender, receiver, initialMessages }) => {
    const [messages, setMessages] = useState(initialMessages || []);
    console.log(messages);
    const [messageInput, setMessageInput] = useState('');
    const chatMessagesRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        if (!sender?._id || !receiver?._id) {
            console.error('Sender or Receiver ID is missing. Cannot connect to chat.');
            alert('Cannot connect to chat: Invalid user data');
            return;
        }

        const senderId = sender._id;
        const receiverId = receiver._id;
        const roomId = [senderId, receiverId].sort().join('_');

        // Connect to Socket.IO
        // socketRef.current = io({
        //     transports: ['websocket', 'polling']
        // });

        socketRef.current = io('https://playplexusbackend.onrender.com', {
  transports: ['websocket', 'polling'],
});

        socketRef.current.on('connect', () => {
            console.log('Connected to Socket.IO server with ID:', socketRef.current.id);
            socketRef.current.emit('joinRoom', roomId);
            console.log('Emitted joinRoom:', roomId);
        });

        socketRef.current.on('connect_error', (error) => {
            console.error('Socket.IO connection error:', error);
            alert('Failed to connect to chat server: ' + error.message);
        });

        socketRef.current.on('receiveMessage', (m) => {
            console.log('Received message:', m);
            // Only add the message if it's from the other user or if it's a confirmation of our own message
            // (though for our own messages, we already add them instantly, so this avoids duplicates)
            if (m.senderId !== senderId) {
                setMessages((prevMessages) => [...prevMessages, m]);
            }
        });

        socketRef.current.on('error', (error) => {
            console.error('Socket.IO error:', error);
            alert('Chat error: ' + error.message);
        });

        // Scroll to bottom on initial load and when messages change
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }

        // Cleanup on component unmount
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [sender, receiver]);

    // Scroll to bottom whenever messages array updates
    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        const message = messageInput.trim();
        if (message && socketRef.current) {
            const senderId = sender._id;
            const receiverId = receiver._id;
            const roomId = [senderId, receiverId].sort().join('_');

            console.log('Sending message:', message);
            socketRef.current.emit('sendMessage', message, senderId, receiverId, roomId);

            const newMessage = {
                message: message,
                senderId: senderId,
                timestamp: new Date().toISOString() // Use ISO string for consistent date handling
            };
            setMessages((prevMessages) => [...prevMessages, newMessage]);
            setMessageInput('');
        }
    };

    return (
        <main className="main-content">
            <div className="page-header">
                <h1>Chat with <span className="highlight">Players</span></h1>
            </div>
            <div className="chat-container">
                <div className="chat-header">
                    <div className="chat-user">
                        <div className="user-avatar">
                            {receiver.username ? (
                                <img src={receiver.profileImage} alt={receiver.username} />
                            ) : (
                                <img src={receiver.logo} alt={receiver.name} />
                            )}
                        </div>
                        <span>{receiver.username || receiver.name}</span>
                    </div>
                    <div className="chat-user">
                        <div className="user-avatar">
                            {sender.username ? (
                                <img src={sender.profileImage} alt={sender.username} />
                            ) : (
                                <img src={sender.logo} alt={sender.name} />
                            )}
                        </div>
                        <span>{sender.username || sender.name} (You)</span>
                    </div>
                </div>
                <div className="chat-messages" id="chatMessages" ref={chatMessagesRef}>
                    {console.log("Messages:", messages)}
                    {messages.length > 0 ? (
                        messages.map((message, index) => (
                            <div
                                key={index} // Using index as key is generally discouraged, use a unique message ID if available
                                className={`message ${message.senderId?.toString() === sender._id?.toString() ? 'sent' : 'received'}`}
                            >
                                <p>{message.message}</p>
                                <span className="timestamp">
                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p>No messages yet. Start a conversation!</p>
                    )}
                </div>
                <form className="chat-input-form" onSubmit={handleSendMessage}>
                    <input
                        type="text"
                        id="chatInput"
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        required
                    />
                    <button type="submit" className="btn-submit">
                        <i className="fa-solid fa-paper-plane"></i> Send
                    </button>
                </form>
            </div>
        </main>
    );
};

export default ChatBox;