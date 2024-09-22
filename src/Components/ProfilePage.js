import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import LeftColumn from './LeftColumn';
import RightColumn from './RightColumn';
import Post from './Post'; // Assuming you have a Post component for displaying posts
import { db, auth } from '../firebase'; // Firebase Firestore and Auth
import { doc, getDoc, query, where, collection, onSnapshot, updateDoc, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import NavBar from './navbar'; // Import NavBar
import { Link } from 'react-router-dom';
import Modal from './Modal'; // Import your Modal component


const ProfilePage = () => {
  const [user, setUser] = useState(null); // Store user's profile data
  const [posts, setPosts] = useState([]); // Store user's posts
  const [loading, setLoading] = useState(true); // Loading state
  const [currentUser, setCurrentUser] = useState(null); // Authenticated user info
  const [isEditingBio, setIsEditingBio] = useState(false); // State for editing bio
  const [isEditingName, setIsEditingName] = useState(false); // State for editing name
  const [newName, setNewName] = useState(''); // New name value
  const [newBio, setNewBio] = useState(''); // New bio value
  const [showPostModal, setShowPostModal] = useState(false); // Control post modal visibility
  const [postContent, setPostContent] = useState(''); // Content for new post
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);

// Fetch followers and their usernames
const fetchFollowers = async () => {
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      const followerIds = userDoc.data().followers || [];
      // Fetch usernames for each follower
      const followersWithDetails = await Promise.all(
        followerIds.map(async (id) => {
          const followerDoc = await getDoc(doc(db, 'users', id));
          if (followerDoc.exists()) {
            return { id, ...followerDoc.data() }; // Return ID and the follower's details
          }
          return null;
        })
      );
      setFollowers(followersWithDetails.filter(follower => follower !== null)); // Remove nulls
      setShowFollowersModal(true);
    }
  } catch (error) {
    console.error('Error fetching followers:', error);
  }
};

// Fetch following users and their usernames
const fetchFollowing = async () => {
  try {
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (userDoc.exists()) {
      const followingIds = userDoc.data().following || [];
      // Fetch usernames for each following user
      const followingWithDetails = await Promise.all(
        followingIds.map(async (id) => {
          const followingDoc = await getDoc(doc(db, 'users', id));
          if (followingDoc.exists()) {
            return { id, ...followingDoc.data() }; // Return ID and the user's details
          }
          return null;
        })
      );
      setFollowing(followingWithDetails.filter(following => following !== null)); // Remove nulls
      setShowFollowingModal(true);
    }
  } catch (error) {
    console.error('Error fetching following:', error);
  }
};

  // Listen to authentication state changes
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth(); 
  }, []);

  // Fetch user data and posts when authenticated
  useEffect(() => {
    if (currentUser) {
      const fetchUser = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser(userData);
            setNewBio(userData.bio || '');
            setNewName(userData.name || '');
          } else {
            console.error('User not found');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      };

      const fetchPosts = () => {
        const postsQuery = query(
          collection(db, 'posts'),
          where('userid', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
          const userPosts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const sortedPosts = userPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
          setPosts(sortedPosts);
          setLoading(false);
        });

        return unsubscribe;
      };

      fetchUser();
      const unsubscribePosts = fetchPosts();

      return () => unsubscribePosts();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const updateName = async () => {
    if (currentUser && newName.trim() !== '') {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          name: newName,
        });
        setUser((prevUser) => ({
          ...prevUser,
          name: newName,
        }));
        setIsEditingName(false);
      } catch (error) {
        console.error('Error updating name:', error);
      }
    }
  };

  const updateBio = async () => {
    if (currentUser && newBio.trim() !== '') {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          bio: newBio,
        });
        setUser((prevUser) => ({
          ...prevUser,
          bio: newBio,
        }));
        setIsEditingBio(false);
      } catch (error) {
        console.error('Error updating bio:', error);
      }
    }
  };

  const handlePostSubmit = async () => {
    if (postContent.trim() !== '') {
      try {
        await addDoc(collection(db, 'posts'), {
          userid: currentUser.uid,
          username: user.name || 'Anonymous User',
          content: postContent,
          date: new Date().toISOString(), // Correctly store the date in ISO format
          like: 0,
          dislike: 0,
          comments: [],
        });
        setPostContent(''); // Reset post content
        setShowPostModal(false); // Close modal after submitting
      } catch (error) {
        console.error('Error creating post:', error);
      }
    }
 
  };
  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handlePostSubmit();
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }


  
  return (
    <>
      <div className="profile-page-layout">
        {/* Left column */}
        <div className="left-column">
     
        </div>
  
        {/* Middle column: Profile content */}
        
        <div className="middle-column">
          <div className="profile-page">
            <div className="profile-info">
              <div className="name-section">
                <h2>
                  {isEditingName ? (
                    <div className="bio-edit">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="bio-input"
                      />
                      <button onClick={updateName} className="save-button">
                        Save
                      </button>
                      <button onClick={() => setIsEditingName(false)} className="cancel-button">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      {user?.name || 'Anonymous User'}
                      {/* Pencil-square-o icon for Edit Name */}
                      <button onClick={() => setIsEditingName(true)} className="name-button">
                        <i className="fas fa-pencil"></i>
                      </button>
                    </>
                  )}
                </h2>
                <p className="uneditable-username">@{user?.username || 'nbafan123'}</p>
              </div>
  
              {/* Bio section */}
              {isEditingBio ? (
                <div className="bio-edit">
                  <input
                    type="text"
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    className="bio-input"
                  />
                  <button onClick={updateBio} className="save-button">
                    Save
                  </button>
                  <button onClick={() => setIsEditingBio(false)} className="cancel-button">
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="bio-section">
                  <p className="bio">{user?.bio || 'This user has no bio'}</p>
                  {/* Pencil icon for Edit Bio */}
                  <button onClick={() => setIsEditingBio(true)} className="edit-button">
                    <i className="fas fa-pencil"></i>
                  </button>
                </div>
              )}
  
              {/* Stats section with Followers and Following */}
              <div className="stats">
                <p>
                  <strong>
                    <button onClick={fetchFollowers} className="follow-button">
                      {user?.followers?.length || 0} Followers
                    </button>
                  </strong>
                </p>
                <p>
                  <strong>
                    <button onClick={fetchFollowing} className="following-button">
                      {user?.following?.length || 0} Following
                    </button>
                  </strong>
                </p>
              </div>
  
              {/* Followers Modal */}
              {showFollowersModal && (
                <Modal title="Followers" onClose={() => setShowFollowersModal(false)}>
                  <ul>
                    {followers.length > 0 ? (
                      followers.map((follower) => (
                        <li key={follower.id}>
                          <Link to={`/user/${follower.id}`}>
                            {follower.username || 'Unknown User'}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <p>No followers yet</p>
                    )}
                  </ul>
                </Modal>
              )}
  
              {/* Following Modal */}
              {showFollowingModal && (
                <Modal title="Following" onClose={() => setShowFollowingModal(false)}>
                  <ul>
                    {following.length > 0 ? (
                      following.map((followingUser) => (
                        <li key={followingUser.id}>
                          <Link to={`/user/${followingUser.id}`}>
                            {followingUser.username || 'Unknown User'}
                          </Link>
                        </li>
                      ))
                    ) : (
                      <p>Not following anyone yet</p>
                    )}
                  </ul>
                </Modal>
              )}
            </div>
  
            {/* Posts section */}
            <div className="profile-posts">
              <h3>Your Hot Takes</h3>
              {posts.length > 0 ? (
                posts.map((post) => <Post key={post.id} post={post} />)
              ) : (
                <p>No posts yet</p>
              )}
            </div>
          </div>
        </div>
  
        {/* Right column */}
        <div className="right-column">
      
        </div>
  
        {/* "Make a Post" button fixed to the bottom right */}
        <button className="make-post-button" onClick={() => setShowPostModal(true)}>
          +
        </button>
  
        {/* Modal for creating a new post */}
        {showPostModal && (
          <div className="post-modal">
            <div className="post-modal-content">
              <textarea
                className="post-input"
                placeholder="What's on your mind?"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className="submit-post-button" onClick={handlePostSubmit}>
                Post
              </button>
              <button className="cancel-post-button" onClick={() => setShowPostModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
  
  

};

export default ProfilePage;
