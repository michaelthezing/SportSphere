import React, { useState, useEffect } from 'react';
import './ProfilePage.css'; // Same styles as your ProfilePage
import LeftColumn from './LeftColumn';
import Post from './Post'; // Assuming you have a Post component for displaying posts
import { db, auth } from '../firebase'; // Firebase Firestore and Auth
import { doc, getDoc, query, where, collection, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom'; // Use useNavigate for navigation in React Router v6
import NavBar from './navbar'; // Import NavBar

const UserProfilePage = () => {
  const { userId } = useParams(); // Get user ID from the URL
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutual, setIsMutual] = useState(false); // New state for mutual following
  const navigate = useNavigate(); // Replace useHistory with useNavigate

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
          // Fetch profile user data
          const userDoc = await getDoc(doc(db, 'users', userId));
          if (userDoc.exists()) {
            const profileUserData = userDoc.data();
            setUser(profileUserData);
  
            // Check if the current user is following the profile user
            const userFollowers = profileUserData.followers || [];
            const isFollowingProfileUser = userFollowers.includes(currentUser.uid);
            setIsFollowing(isFollowingProfileUser);
  
            // Fetch current user data for mutual follow check
            const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (currentUserDoc.exists()) {
              const currentUserData = currentUserDoc.data();
              const currentUserFollowing = currentUserData.following || [];
  
              // Check for mutual followers (both following each other)
              const isMutualFollower = isFollowingProfileUser && currentUserFollowing.includes(userId);
              setIsMutual(isMutualFollower);
            } else {
              console.error('Current user data not found');
            }
          } else {
            console.error('Profile user not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };
  
      // Fetch posts related to the profile user
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
  
          // Sort posts by date (most recent first)
          const sortedPosts = userPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
          setPosts(sortedPosts);
          setLoading(false);
        });
  
        return unsubscribe;
      };
  
      // Execute both fetching functions
      fetchUserData();
      const unsubscribePosts = fetchPosts();
  
      // Cleanup function to unsubscribe from posts listener
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

      // Check if mutual following is now established
      setIsMutual(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };
  const refreshUserData = async () => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      setUser(userDoc.data());
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
      refreshUserData();

      setUser((prevUser) => ({
        ...prevUser,
        followers: prevUser.followers.filter((followerId) => followerId !== currentUser.uid), // Update followers in state
      }));

      // Check if mutual following is no longer valid
      setIsMutual(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  // Handle messaging a user
  const messageUser = () => {
    if (!currentUser || !user) return;

    // Navigate to the messaging page, assuming it's located at /messages/:userId
    navigate(`/message`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
    {/* Assuming you have a NavBar component */}
      <div className="profile-page-layout">
        {/* Left column */}
        <div className="left-column">
         
        </div>

        {/* Middle column: Profile content */}
        <div className="middle-column">
          <div className="profile-page">
            <div className="profile-info">
              <div className="name-section">
                <h2>{user?.name || 'Anonymous User'}</h2>
                <p className="uneditable-username">@{user?.username || 'nbafan123'}</p>
              </div>

              <div className="bio-section">
                <p className="bio">{user?.bio || 'This user has no bio'}</p>
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

                {/* Message button - only appears if mutual */}
                {isMutual && (
                  <button onClick={messageUser} className="following-button">Message</button>
                )}
              </div>
            </div>

            <div className="profile-posts">
              <h3>{user?.name || 'User'}'s Hot Takes</h3>
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
        
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
