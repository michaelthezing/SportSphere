import React, { useState, useEffect } from 'react';
import './MiddleColumn.css';
import Post from './Post';
import { db, auth } from '../firebase';
import {
  collection,
  addDoc,
  query,
  onSnapshot,
  doc,
  getDoc,
  orderBy,
  where,
} from 'firebase/firestore';
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

  // Track which thread is currently selected.
  // Default is 'main' to show everything unless a user clicks on a team/player
  const [currentThread, setCurrentThread] = useState('main');

  useEffect(() => {
    // Auth state listener
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
        console.error('No user document found!');
      }
    } catch (error) {
      console.error('Error fetching username: ', error);
    }
  };

  // Fetch all posts (ordered by most recent)
  useEffect(() => {
    const postsQuery = query(collection(db, 'posts'), orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const allPosts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(allPosts);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch posts from followed users
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

  // Whenever filterQuery changes, if it has a 'name', update currentThread
  useEffect(() => {
    if (filterQuery && filterQuery.name) {
      setCurrentThread(filterQuery.name);
    }
  }, [filterQuery]);

  // Submit new post to the currentThread
  const handlePostSubmit = async (thread = currentThread) => {
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

  // Filter which posts to show
  const renderPosts = () => {
    let filteredPosts = posts;

    // If we're in a specific thread (not 'main'), show only those posts
    if (currentThread !== 'main') {
      filteredPosts = filteredPosts.filter((post) => post.thread === currentThread);
    }

    // If user clicked on a name and we want to do text-based search,
    // you could also incorporate that here. Right now, we only rely on thread matching.

    // If 'following' tab is selected, show only followingPosts. (Optional logic)
    if (tab === 'all') {
      return filteredPosts.map((post) => <Post key={post.id} post={post} />);
    } else if (tab === 'following') {
      // Filter following posts by the same thread
      return followingPosts
        .filter((post) => currentThread === 'main' || post.thread === currentThread)
        .map((post) => <Post key={post.id} post={post} />);
    }
  };

  // Switch tabs between "All" and "Following"
  const handleTabSwitch = (selectedTab) => {
    setTab(selectedTab);

    // If switching back to "All," you might want to reset thread to 'main'
    // That way, users see all posts again
    if (selectedTab === 'all') {
      setCurrentThread('main');
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
        <i
          className="fas fa-paper-plane sendIcon"
          onClick={() => handlePostSubmit(currentThread)}
        />
      </div>

      <div className="postList">{renderPosts()}</div>
    </div>
  );
}
