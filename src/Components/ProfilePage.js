import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import LeftColumn from './LeftColumn';
import RightColumn from './RightColumn';
import Post from './Post'; // Assuming you have a Post component for displaying posts
import { db, auth } from '../firebase'; // Firebase Firestore and Auth
import { doc, getDoc, query, where, collection, onSnapshot, updateDoc, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import NavBar from './navbar'; // Import NavBar


const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBio, setNewBio] = useState('');
  const [showPostModal, setShowPostModal] = useState(false); // To handle showing/hiding the post modal
  const [postContent, setPostContent] = useState(''); // Content for new post

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
            setUser(userDoc.data());
            setNewBio(userDoc.data().bio || '');
            setNewName(userDoc.data().name || '');
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
  

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <NavBar /> {/* Include the NavBar at the top */}
      <div className="profile-page-layout">
        {/* Left column */}
        <div className="left-column">
          <LeftColumn />
        </div>

        {/* Middle column: Profile content */}
        <div className="middle-column">
          <div className="profile-page">
            <div className="profile-info">
              <div className="name-section">
                <h2>{isEditingName ? (
                  <div className="bio-edit">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="bio-input"
                    />
                    <button onClick={updateName} className="save-button">Save</button>
                    <button onClick={() => setIsEditingName(false)} className="cancel-button">Cancel</button>
                  </div>
                ) : (
                  <>
                    {user?.name || "Anonymous User"}
                    <button onClick={() => setIsEditingName(true)} className="name-button">Edit Name</button>
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
                  <button onClick={updateBio} className="save-button">Save</button>
                  <button onClick={() => setIsEditingBio(false)} className="cancel-button">Cancel</button>
                </div>
              ) : (
                <div className="bio-section">
                  <p className="bio">{user?.bio || "This user has no bio"}</p>
                  <button onClick={() => setIsEditingBio(true)} className="edit-button">Edit Bio</button>
                </div>
              )}

              <div className="stats">
                <p><strong>{user?.following || 0}</strong> Following</p>
                <p><strong>{user?.followers || 0}</strong> Followers</p>
              </div>
            </div>
            <div className="profile-posts">
              <h3>Your Hot Takes</h3>
              {posts.length > 0 ? (
                posts.map(post => (
                  <Post key={post.id} post={post} />
                ))
              ) : (
                <p>No posts yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="right-column">
          <RightColumn />
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
              />
              <button className="submit-post-button" onClick={handlePostSubmit}>Post</button>
              <button className="cancel-post-button" onClick={() => setShowPostModal(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
