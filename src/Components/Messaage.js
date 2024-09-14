import React, { useState, useEffect } from 'react';
import { collection, doc, query, onSnapshot, getDoc, getDocs, where, addDoc, updateDoc } from 'firebase/firestore'; // Import Firestore functions
import { db, auth } from '../firebase'; // Firebase configuration
import './Message.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserCircle, faPaperPlane } from '@fortawesome/free-solid-svg-icons'; // Import icons

export default function MessagesPage() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // The user you're messaging
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Add error state for debugging
  const [currentUser, setCurrentUser] = useState(null); // State for current user

  // Track the authentication state to ensure we always have a valid currentUser
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setError('User not authenticated');
      }
    });
    return () => unsubscribeAuth();
  }, []);

  // Fetch mutual followers (users who you follow and who follow you back)
  useEffect(() => {
    if (!currentUser) {
      setError('User not authenticated');
      return; // Early return if the user is not authenticated
    }

    const fetchMutualFollowers = async () => {
      setLoading(true); // Show loading state
      setError(null); // Reset any previous error
      try {
        console.log('Fetching document for user:', currentUser.uid);
        const currentUserDocRef = doc(db, 'users', currentUser.uid);
        const currentUserDoc = await getDoc(currentUserDocRef);

        if (currentUserDoc.exists()) {
          const { following = [], followers = [] } = currentUserDoc.data();
          console.log('Following:', following);
          console.log('Followers:', followers);

          if (!following.length || !followers.length) {
            setError('No followers or following found');
            setLoading(false);
            return;
          }

          const mutualFollowers = following.filter((userId) => followers.includes(userId));
          console.log('Mutual Followers:', mutualFollowers);

          if (!mutualFollowers.length) {
            setError('No mutual followers found');
            setLoading(false);
            return;
          }

          // Fetch user details of mutual followers
          const usersRef = collection(db, 'users');
          const unsubscribe = onSnapshot(usersRef, (snapshot) => {
            const fetchedUsers = snapshot.docs
              .map((doc) => ({ id: doc.id, ...doc.data() }))
              .filter((user) => mutualFollowers.includes(user.id));
            setUsers(fetchedUsers);
            console.log('Fetched users:', fetchedUsers);
          });

          return unsubscribe; // Return the unsubscribe function
        } else {
          setError('User document does not exist');
        }
      } catch (error) {
        console.error('Error fetching mutual followers:', error);
        setError('Error fetching mutual followers');
      } finally {
        setLoading(false); // Stop loading state
      }
    };

    const unsubscribeFetch = fetchMutualFollowers();

    // Return unsubscribe if it exists, otherwise return an empty function
    return () => {
      if (typeof unsubscribeFetch === 'function') {
        unsubscribeFetch();
      }
    };
  }, [currentUser]);

  // Fetch messages between the current user and the selected user
  useEffect(() => {
    if (!selectedUser || !currentUser) return;

    const fetchMessages = () => {
      const conversationsRef = collection(db, 'conversations');
      const q = query(conversationsRef, where('participants', 'array-contains', currentUser.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const conversation = snapshot.docs
          .map((doc) => doc.data())
          .find((convo) => convo.participants.includes(selectedUser.id));
        if (conversation) {
          setMessages(conversation.messages || []);
        } else {
          setMessages([]);
        }
      });
      return unsubscribe;
    };

    const unsubscribeMessages = fetchMessages();

    return () => {
      if (typeof unsubscribeMessages === 'function') {
        unsubscribeMessages(); // Clean up listener on component unmount
      }
    };
  }, [selectedUser, currentUser]);

  // Handle sending messages
  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || !currentUser || !selectedUser) return;

    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('participants', 'array-contains', currentUser.uid));

    const messageObject = {
      senderId: currentUser.uid,
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    const snapshot = await getDocs(q);
    const conversationDoc = snapshot.docs.find((doc) =>
      doc.data().participants.includes(selectedUser.id)
    );

    if (conversationDoc) {
      const conversationRef = doc(db, 'conversations', conversationDoc.id);
      const updatedMessages = [...conversationDoc.data().messages, messageObject];
      await updateDoc(conversationRef, { messages: updatedMessages });

      setMessages(updatedMessages);
    } else {
      const newConversation = {
        participants: [currentUser.uid, selectedUser.id],
        messages: [messageObject],
      };
      await addDoc(conversationsRef, newConversation);

      setMessages([messageObject]);
    }

    setNewMessage('');
    
  };
  useEffect(() => {
    // Add the class to the body when the component mounts
    document.body.classList.add('messages-page-body');

    // Cleanup: remove the class from the body when the component unmounts
    return () => {
      document.body.classList.remove('messages-page-body');
    };
  }, []);

  return (
    <div className="messages-page">
      <div className="users-list">
        <h3>Mutual Followers</h3>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <ul>
            {users.map(user => (
              <li key={user.id} onClick={() => setSelectedUser(user)}>
                <FontAwesomeIcon icon={faUserCircle} className="user-icon" /> {/* User icon */}
                <span className="username">{user.username || 'Unknown User'}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="chat-box">
        {selectedUser ? (
          <>
            <h3>Chat with {selectedUser.username}</h3>
            <div className="messages-list">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.senderId === currentUser.uid ? 'sent' : 'received'}`}
                >
                  <p>{message.content}</p>
                  <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
            <div className="message-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
              <button onClick={handleSendMessage}>
                <FontAwesomeIcon icon={faPaperPlane} /> {/* Send button icon */}
              </button>
            </div>
          </>
        ) : (
          <p>Select a user to start a conversation.</p>
        )}
      </div>
    </div>
  );
}
