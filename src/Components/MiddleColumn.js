import React, { useState, useEffect } from 'react';
import './MiddleColumn.css';
import Post from './Post';
import { db, auth } from '../firebase'; // Firebase Firestore and Auth
import { collection, addDoc, query, onSnapshot, doc, getDoc, orderBy, where } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function MiddleColumn({ filterQuery }) {
  const [isFocused, setIsFocused] = useState(false);
  const [posts, setPosts] = useState([]);
  const [followingPosts, setFollowingPosts] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState('all');
  const [currentThread, setCurrentThread] = useState('main'); // State to track the active thread

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUsername(user.uid);
        await fetchFollowingPosts(user.uid);
      } else {
        setCurrentUser(null);
        setUsername('');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const fetchUsername = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        setUsername(userDoc.data().username);
      } else {
        console.error("No such document!");
      }
    } catch (error) {
      console.error("Error fetching username: ", error);
    }
  };

  useEffect(() => {
    const fetchPosts = () => {
      const postsQuery = query(
        collection(db, 'posts'),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
        const allPosts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(allPosts);
        setLoading(false);
      });

      return unsubscribe;
    };

    const unsubscribePosts = fetchPosts();

    return () => unsubscribePosts();
  }, []);

  const fetchFollowingPosts = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const followingList = userDoc.data().following || [];

        if (followingList.length > 0) {
          const followingPostsQuery = query(
            collection(db, 'posts'),
            where('userid', 'in', followingList),
            orderBy('date', 'desc')
          );

          const unsubscribe = onSnapshot(followingPostsQuery, (snapshot) => {
            const followingPosts = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));

            setFollowingPosts(followingPosts);
          });

          return unsubscribe;
        } else {
          setFollowingPosts([]);
        }
      }
    } catch (error) {
      console.error('Error fetching following posts: ', error);
    }
  };

  const handlePostSubmit = async (thread = 'main') => {
    if (inputValue.trim() !== '' && currentUser && username) {
      try {
        await addDoc(collection(db, 'posts'), {
          userid: currentUser.uid,
          content: inputValue,
          username: username,
          date: new Date().toISOString(),
          like: 0,
          dislike: 0,
          thread: thread,
        });
        setInputValue('');
        setIsFocused(false);
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

  const renderPosts = () => {
    let filteredPosts = posts;

    if (filterQuery || currentThread !== 'main') {
      const searchTerms = filterQuery ? filterQuery.toLowerCase().split(' ') : [];
      filteredPosts = filteredPosts.filter((post) => {
        const postContent = post.content.toLowerCase();
        const isInThread = post.thread === currentThread;
        const matchesQuery = searchTerms.length === 0|| searchTerms.some((term) => postContent.includes(term));
        return isInThread && matchesQuery;
      });
    }

    if (tab === 'all') {
      return filteredPosts.map((post) => <Post key={post.id} post={post} />);
    } else if (tab === 'following') {
      return followingPosts.length > 0
        ? followingPosts.map((post) => <Post key={post.id} post={post} />)
        : <p>No posts from followed users</p>;
    }
  };

  const handleTabSwitch = (selectedTab) => {
    setTab(selectedTab);
    if (selectedTab === 'all') {
      setCurrentThread('main'); // Reset thread when switching to "All"
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="MiddleColumn">
      <div className="tabSelector">
        <button
          className={`tabButton ${tab === 'all' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('all')}
        >
          All
        </button>
        <button
          className={`tabButton ${tab === 'following' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('following')}
        >
          Following
        </button>
      </div>

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
        <i className="fas fa-paper-plane sendIcon" onClick={handlePostSubmit}></i>
      </div>

      <div className="postList">
        {renderPosts()}
      </div>
    </div>
  );
}
