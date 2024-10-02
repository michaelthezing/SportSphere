import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import LeftColumn from './LeftColumn';
import Post from './Post';
import { db, auth } from '../firebase';
import { doc, getDoc, query, where, collection, onSnapshot, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import NavBar from './navbar';

const UserProfilePage = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutual, setIsMutual] = useState(false);
  const navigate = useNavigate();

  // Function to initialize user's followers and following fields if they don't exist
  const initializeUserFields = async (userId) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (!userData.followers) {
        await updateDoc(doc(db, 'users', userId), { followers: [] });
      }
      if (!userData.following) {
        await updateDoc(doc(db, 'users', userId), { following: [] });
      }
    }
  };

  // Function to refresh the user data after following/unfollowing
  const refreshUserData = async () => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      setUser(userDoc.data());
    }
  };

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        setCurrentUser(user);
        initializeUserFields(user.uid); // Initialize fields for current user
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
            const profileUserData = userDoc.data();
            setUser(profileUserData);
  
            const userFollowers = profileUserData.followers || [];
            const isFollowingProfileUser = userFollowers.includes(currentUser.uid);
            setIsFollowing(isFollowingProfileUser);
  
            const currentUserDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (currentUserDoc.exists()) {
              const currentUserData = currentUserDoc.data();
              const currentUserFollowing = currentUserData.following || [];
  
              const isMutualFollower = isFollowingProfileUser && currentUserFollowing.includes(userId);
              setIsMutual(isMutualFollower);
            }
          } else {
            console.error('Profile user not found');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
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

  const followUser = async () => {
    if (!currentUser || !user) return;

    try {
      const currentUserRef = doc(db, 'users', currentUser.uid);
      const profileUserRef = doc(db, 'users', userId);

      await updateDoc(profileUserRef, {
        followers: arrayUnion(currentUser.uid),
      });

      await updateDoc(currentUserRef, {
        following: arrayUnion(userId),
      });

      setIsFollowing(true);
      setUser((prevUser) => ({
        ...prevUser,
        followers: [...(prevUser.followers || []), currentUser.uid],
      }));

      setIsMutual(true);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const unfollowUser = async () => {
    if (!currentUser || !user) return;

    try {
      const currentUserRef = doc(db, 'users', currentUser.uid);
      const profileUserRef = doc(db, 'users', userId);

      await updateDoc(profileUserRef, {
        followers: arrayRemove(currentUser.uid),
      });

      await updateDoc(currentUserRef, {
        following: arrayRemove(userId),
      });

      setIsFollowing(false);
      refreshUserData();

      setUser((prevUser) => ({
        ...prevUser,
        followers: prevUser.followers.filter((followerId) => followerId !== currentUser.uid),
      }));

      setIsMutual(false);
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
  };

  const messageUser = () => {
    if (!currentUser || !user) return;
    navigate(`/message`);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="profile-page-layout">
        <div className="left-column"></div>
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

              <div className="follow-section">
                {isFollowing ? (
                  <button onClick={unfollowUser} className="unfollow-button">Unfollow</button>
                ) : (
                  <button onClick={followUser} className="follow-button">Follow</button>
                )}
                {isMutual && (
                  <button onClick={messageUser} className="following-button">Message</button>
                )}
              </div>
            </div>

            <div className="profile-posts">
              <h3>{user?.name || 'User'}'s Hot Takes</h3>
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
        <div className="right-column"></div>
      </div>
    </>
  );
};

export default UserProfilePage;
