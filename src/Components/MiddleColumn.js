import React, { useState, useEffect } from 'react';
import './MiddleColumn.css';
import Post from './Post';
import { db, auth } from '../firebase'; // Firebase Firestore and Auth
import { collection, addDoc, query, onSnapshot, doc, getDoc, orderBy } from 'firebase/firestore'; // Removed "where"
import { onAuthStateChanged } from 'firebase/auth'; // Import listener for auth state changes

export default function MiddleColumn() {
  const [isFocused, setIsFocused] = useState(false);
  const [posts, setPosts] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [username, setUsername] = useState(''); // Fetch and store dynamic username
  const [loading, setLoading] = useState(true); // Add a loading state
  const [currentUser, setCurrentUser] = useState(null); // Use state for current user

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user); // Set the authenticated user
        await fetchUsername(user.uid); // Fetch the username when user is logged in
      } else {
        setCurrentUser(null); // Handle user logout
        setUsername(''); // Clear username when logged out
      }
    });

    return () => unsubscribeAuth(); // Cleanup the listener on unmount
  }, []);

  // Function to fetch the logged-in user's username
  const fetchUsername = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUsername(userDoc.data().username); // Set the fetched username
      } else {
        console.error("No such document!"); // Handle case when user doesn't exist
      }
    } catch (error) {
      console.error("Error fetching username: ", error);
    }
  };

  useEffect(() => {
    // Fetch all posts from the Firestore database
    const fetchPosts = () => {
      const postsQuery = query(
        collection(db, 'posts'),
        orderBy('date', 'desc') // Sort by date (newest posts first)
      );

      const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const allPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(allPosts); // Set the fetched posts into state
        setLoading(false); // Stop loading when posts are fetched
      });

      return unsubscribe;
    };

    const unsubscribePosts = fetchPosts();

    return () => unsubscribePosts(); // Cleanup the posts listener
  }, []);

  const handlePostSubmit = async () => {
    if (inputValue.trim() !== '' && currentUser && username) {
      try {
        // Add the new post to Firestore
        await addDoc(collection(db, 'posts'), {
          userid: currentUser.uid,
          content: inputValue,
          username: username, // Use the dynamically fetched username
          date: new Date().toISOString(),
          like: 0,
          dislike: 0,
        });
        setInputValue(''); // Clear the input field
        setIsFocused(false); // Unfocus the input field
      } catch (error) {
        console.error('Error adding post: ', error);
      }
    } else {
      console.error('User not authenticated or missing input value');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handlePostSubmit();
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading message while fetching posts
  }

  return (
    <div className="MiddleColumn">
      <div className={`shareBox ${isFocused ? 'focused' : ''}`}>
        <input
          type="text"
          placeholder="What's your sport take?"
          className="shareInput"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <i
          className="fas fa-paper-plane sendIcon"
          onClick={handlePostSubmit}
        ></i>
      </div>

      <div className="postList">
        {posts.map((post) => (
          <Post key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
