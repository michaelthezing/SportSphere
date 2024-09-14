import React, { useState, useEffect } from 'react';
import './ProfilePage.css'; // Same styles as your ProfilePage
import LeftColumn from './LeftColumn';
import RightColumn from './RightColumn';
import Post from './Post'; // Assuming you have a Post component for displaying posts
import { db, auth } from '../firebase'; // Firebase Firestore and Auth
import { doc, getDoc, query, where, collection, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import NavBar from './navbar'; // Import NavBar

const UserProfilePage = () => {
  const { userId } = useParams(); // Get user ID from the URL
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch user data and posts when the component mounts
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user); // Set current authenticated user
      } else {
        setCurrentUser(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            setUser(userDoc.data());
            // Check if the current user is already following the profile user
            setIsFollowing(userDoc.data().followers?.includes(currentUser.uid) || false);
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
          where('userid', '==', userId)
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

      fetchUserData();
      const unsubscribePosts = fetchPosts();

      return () => unsubscribePosts();
    }
  }, [userId, currentUser]);

  // Handle following a user
  const followUser = async () => {
    if (!currentUser || !user) return;

    try {
      const currentUserRef = doc(db, 'users', currentUser.uid); // Reference to the current user's doc
      const profileUserRef = doc(db, 'users', userId); // Reference to the profile user's doc

      // Update the profile user's followers and the current user's following
      await updateDoc(profileUserRef, {
        followers: arrayUnion(currentUser.uid), // Add current user's ID to the profile user's followers
      });

      await updateDoc(currentUserRef, {
        following: arrayUnion(userId), // Add the profile user's ID to the current user's following
      });

      // Update local state
      setIsFollowing(true);
      setUser((prevUser) => ({
        ...prevUser,
        followers: [...(prevUser.followers || []), currentUser.uid], // Update followers array in local state
      }));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  // Handle unfollowing a user
  const unfollowUser = async () => {
    if (!currentUser || !user) return;

    try {
      const currentUserRef = doc(db, 'users', currentUser.uid);
      const profileUserRef = doc(db, 'users', userId);

      // Update Firestore to remove followers and following
      await updateDoc(profileUserRef, {
        followers: arrayRemove(currentUser.uid), // Remove current user's ID from the profile user's followers
      });

      await updateDoc(currentUserRef, {
        following: arrayRemove(userId), // Remove profile user's ID from current user's following
      });

      // Update local state
      setIsFollowing(false);
      setUser((prevUser) => ({
        ...prevUser,
        followers: prevUser.followers.filter((followerId) => followerId !== currentUser.uid), // Remove follower locally
      }));
    } catch (error) {
      console.error('Error unfollowing user:', error);
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
                <h2>{user?.name || "Anonymous User"}</h2>
                <p className="uneditable-username">@{user?.username || 'nbafan123'}</p>
              </div>

              <div className="bio-section">
                <p className="bio">{user?.bio || "This user has no bio"}</p>
              </div>

              <div className="stats">
                <p><strong>{user?.followers?.length || 0}</strong> Followers</p>
                <p><strong>{user?.following?.length || 0}</strong> Following</p>
              </div>

              {/* Follow/Unfollow Button */}
              <div className="follow-section">
                {isFollowing ? (
                  <button onClick={unfollowUser} className="unfollow-button">Unfollow</button>
                ) : (
                  <button onClick={followUser} className="follow-button">Follow</button>
                )}
              </div>
            </div>

            <div className="profile-posts">
              <h3>{user?.name || "User"}'s Hot Takes</h3>
              {posts.length > 0 ? (
                posts.map(post => (
                  <Post key={post.id} post={post} /> // Reuse the Post component, without edit/delete options
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
      </div>
    </>
  );
};

export default UserProfilePage;
