import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const FollowingPage = () => {
  const { userId } = useParams(); // Get the userId from the URL params
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        // Get the user's following list
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const followingIds = userData.following || [];

          // Fetch each following user's details
          const followingDetails = await Promise.all(
            followingIds.map(async (id) => {
              const followingUserDoc = await getDoc(doc(db, 'users', id));
              return followingUserDoc.exists() ? { id, ...followingUserDoc.data() } : null;
            })
          );

          // Filter out any null values (in case a user no longer exists)
          setFollowing(followingDetails.filter((user) => user !== null));
          setUser(userData);
        } else {
          console.error('User not found');
        }
      } catch (error) {
        console.error('Error fetching following users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{user?.name}'s Following</h2>
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
    </div>
  );
};

export default FollowingPage;
