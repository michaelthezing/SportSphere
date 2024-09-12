import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const FollowersPage = () => {
  const { userId } = useParams(); // Get the userId from the URL params
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        // Get the user's followers list
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const followersIds = userData.followers || [];

          // Fetch each follower's details
          const followersDetails = await Promise.all(
            followersIds.map(async (id) => {
              const followerUserDoc = await getDoc(doc(db, 'users', id));
              return followerUserDoc.exists() ? { id, ...followerUserDoc.data() } : null;
            })
          );

          // Filter out any null values (in case a user no longer exists)
          setFollowers(followersDetails.filter((user) => user !== null));
          setUser(userData);
        } else {
          console.error('User not found');
        }
      } catch (error) {
        console.error('Error fetching followers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>{user?.name}'s Followers</h2>
      <ul>
        {followers.length > 0 ? (
          followers.map((followerUser) => (
            <li key={followerUser.id}>
              <Link to={`/user/${followerUser.id}`}>
                {followerUser.username || 'Unknown User'}
              </Link>
            </li>
          ))
        ) : (
          <p>No followers yet</p>
        )}
      </ul>
    </div>
  );
};

export default FollowersPage;
