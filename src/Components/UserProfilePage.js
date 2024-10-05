import React, { useState, useEffect } from 'react';
import './ProfilePage.css';
import LeftColumn from './LeftColumn';
import Post from './Post';
import { db, auth } from '../firebase';
import { doc, getDoc, query, where, collection, onSnapshot, updateDoc, arrayUnion, arrayRemove, runTransaction } from 'firebase/firestore';
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
      const userDocRef = doc(db, 'users', userId);

      // Listen to real-time updates on the profile user's data
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const profileUserData = docSnapshot.data();
          setUser(profileUserData);

          const isFollowingProfileUser = profileUserData.followers?.includes(currentUser.uid);
          setIsFollowing(isFollowingProfileUser);

          // Check if it's a mutual follow
          setIsMutual(profileUserData.following?.includes(currentUser.uid));
        } else {
          console.error('Profile user not found');
        }
      });

      const fetchPosts = () => {
        const postsQuery = query(
          collection(db, 'posts'),
          where('userid', '==', userId)
        );

        const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
          const userPosts = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const sortedPosts = userPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
          setPosts(sortedPosts);
          setLoading(false);
        });

        return unsubscribePosts;
      };

      const unsubscribePosts = fetchPosts();

      return () => {
        unsubscribe();
        unsubscribePosts();
      };
    }
  }, [userId, currentUser]);

  const followUser = async () => {
    if (!currentUser || !user) return;

    try {
      // Use a transaction to ensure both users are updated atomically
      await runTransaction(db, async (transaction) => {
        const currentUserRef = doc(db, 'users', currentUser.uid);
        const profileUserRef = doc(db, 'users', userId);

        // Fetch user documents in the transaction
        const currentUserDoc = await transaction.get(currentUserRef);
        const profileUserDoc = await transaction.get(profileUserRef);

        if (!currentUserDoc.exists() || !profileUserDoc.exists()) {
          throw new Error('One of the users does not exist.');
        }

        // Update followers and following arrays
        transaction.update(profileUserRef, {
          followers: arrayUnion(currentUser.uid),
        });

        transaction.update(currentUserRef, {
          following: arrayUnion(userId),
        });
      });

      // Optimistic update on local state
      setIsFollowing(true);
      setUser((prevUser) => ({
        ...prevUser,
        followers: [...(prevUser.followers || []), currentUser.uid],
      }));

      // Check for mutual following status
      setIsMutual((prevIsMutual) => {
        const currentUserFollowing = currentUser?.following || [];
        return prevIsMutual || currentUserFollowing.includes(userId);
      });
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const unfollowUser = async () => {
    if (!currentUser || !user) return;

    try {
      // Use a transaction to ensure both users are updated atomically
      await runTransaction(db, async (transaction) => {
        const currentUserRef = doc(db, 'users', currentUser.uid);
        const profileUserRef = doc(db, 'users', userId);

        // Fetch user documents in the transaction
        const currentUserDoc = await transaction.get(currentUserRef);
        const profileUserDoc = await transaction.get(profileUserRef);

        if (!currentUserDoc.exists() || !profileUserDoc.exists()) {
          throw new Error('One of the users does not exist.');
        }

        // Update followers and following arrays
        transaction.update(profileUserRef, {
          followers: arrayRemove(currentUser.uid),
        });

        transaction.update(currentUserRef, {
          following: arrayRemove(userId),
        });
      });

      // Optimistic update on local state
      setIsFollowing(false);
      setUser((prevUser) => ({
        ...prevUser,
        followers: prevUser.followers.filter((followerId) => followerId !== currentUser.uid),
      }));

      // Set mutual follow to false
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
