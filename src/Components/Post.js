import React, { useState, useEffect } from 'react';
import { doc, updateDoc, deleteDoc, arrayUnion, addDoc, collection, getDoc, arrayRemove, setDoc} from 'firebase/firestore'; // Import Firestore methods
import { db, auth } from '../firebase'; // Import Firebase config and auth
import './Post.css';
import { Link,useNavigate } from 'react-router-dom';


export default function Post({ post, onDelete }) { // onDelete is a callback to dynamically remove the post from the UI
  const [like, setLike] = useState(post.like || 0);
  const [dislike, setDislike] = useState(post.dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [hasReposted, setHasReposted] = useState(false);
  const [repostedPostId, setRepostedPostId] = useState(null); // Store reposted post ID
  

  const postRef = doc(db, 'posts', post.id); // Get a reference to the post in Firestore

  const currentUser = auth.currentUser; // Get the current authenticated user
  const navigate = useNavigate();


  // Handle liking a post and update Firestore
  const likeHandler = async () => {
    let newLike = like;
    let newDislike = dislike;
    if (isLiked) {
      newLike = like - 1;
    } else {
      newLike = like + 1;
      if (isDisliked) {
        newDislike = dislike - 1;
        setIsDisliked(false);
      }
    }
    setIsLiked(!isLiked);
    setLike(newLike);
    setDislike(newDislike);

    try {
      await updateDoc(postRef, {
        like: newLike,
        dislike: newDislike,
      });
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  // Handle disliking a post and update Firestore
  const dislikeHandler = async () => {
    let newDislike = dislike;
    let newLike = like;
    if (isDisliked) {
      newDislike = dislike - 1;
    } else {
      newDislike = dislike + 1;
      if (isLiked) {
        newLike = like - 1;
        setIsLiked(false);
      }
    }
    setIsDisliked(!isDisliked);
    setLike(newLike);
    setDislike(newDislike);

    try {
      await updateDoc(postRef, {
        dislike: newDislike,
        like: newLike,
      });
    } catch (error) {
      console.error('Error updating dislikes:', error);
    }
  };

  // Add a new comment and update Firestore
  const addComment = async () => {
    if (commentInput.trim() !== '') {
      // Use displayName if it's available, else fall back to email or a default value
      const username = currentUser?.username || currentUser?.email || 'Unknown User';

      const newComment = {
        text: commentInput,
        username: username, // Use the displayName of the logged-in user
        like: 0,
        dislike: 0,
        userId: currentUser.uid,
      };

      const updatedComments = [...comments, newComment];
      setComments(updatedComments);
      setCommentInput(''); // Clear the comment input field

      try {
        await updateDoc(postRef, {
          comments: arrayUnion(newComment), // Update Firestore with the new comment
        });
      } catch (error) {
        console.error('Error adding comment:', error);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      addComment();
    }
  };

  // Handle deleting a post
  const deletePost = async () => {
    try {
      await deleteDoc(postRef); // Delete the post from Firestore
      onDelete(post.id); // Call the onDelete callback to remove the post from UI
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const likeComment = async (commentIndex) => {
    const updatedComments = [...comments];
    const comment = updatedComments[commentIndex];

    if (comment.isLiked) {
      comment.like -= 1;
      comment.isLiked = false;
    } else {
      comment.like += 1;
      comment.isLiked = true;

      if (comment.isDisliked) {
        comment.dislike -= 1;
        comment.isDisliked = false;
      }
    }

    setComments(updatedComments);

    try {
      await updateDoc(postRef, { comments: updatedComments });
    } catch (error) {
      console.error('Error updating comment likes:', error);
    }
  };

  const dislikeComment = async (commentIndex) => {
    const updatedComments = [...comments];
    const comment = updatedComments[commentIndex];

    if (comment.isDisliked) {
      comment.dislike -= 1;
      comment.isDisliked = false;
    } else {
      comment.dislike += 1;
      comment.isDisliked = true;

      if (comment.isLiked) {
        comment.like -= 1;
        comment.isLiked = false;
      }
    }

    setComments(updatedComments);

    try {
      await updateDoc(postRef, { comments: updatedComments });
    } catch (error) {
      console.error('Error updating comment dislikes:', error);
    }
  };

  const deleteComment = async (commentIndex) => {
    const updatedComments = comments.filter((_, index) => index !== commentIndex);
    setComments(updatedComments);

    try {
      await updateDoc(postRef, { comments: updatedComments });
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  const repostHandler = async () => {
    try {
      const repostedPostRef = doc(db, 'posts', `${currentUser.uid}_${post.id}_repost`); // Reference to the reposted post
      const repostedPostDoc = await getDoc(repostedPostRef);

      if (repostedPostDoc.exists()) {
        // If the user has already reposted, remove the repost
        await deleteDoc(repostedPostRef); // Delete the reposted post from Firestore
        await updateDoc(postRef, {
          repostedBy: arrayRemove(currentUser.uid), // Remove user from repostedBy array
        });

        setHasReposted(false); // Update state to reflect that repost has been removed
        setRepostedPostId(null); // Reset repostedPostId
        console.log('Repost successfully removed!');
      } else {
        // If the user hasn't reposted yet, add the repost
        const repostedPost = {
          content: post?.desc || post.content,
          username: currentUser.displayName || currentUser.email, // Keep the reposted by user's name
          originalAuthor: post.username, // Store the original author separately for display
          userid: currentUser.uid, // Logged-in user's ID
          like: 0,
          dislike: 0,
          comments: [],
          isRepost: true, // Flag to indicate it's a repost
          originalPostId: post.id, // Reference to the original post
          originalUsername: post.username, // Original post's username
          date: new Date().toISOString(), // Timestamp for the repost
        };

        // Add reposted post to Firestore with a unique ID for the repost
        await setDoc(repostedPostRef, repostedPost); // Use setDoc to specify the repost document ID

        // Update the original post to track who reposted
        await updateDoc(postRef, {
          repostedBy: arrayUnion(currentUser.uid), // Add user to repostedBy array
        });

        setHasReposted(true); // Update state to reflect that repost has been added
        setRepostedPostId(repostedPostRef.id); // Store reposted post ID
        console.log('Post successfully reposted!');
      }
    } catch (error) {
      console.error('Error handling repost:', error);
    }
  };
  useEffect(() => {
    const checkReposted = async () => {
      try {
        const repostRef = doc(db, 'posts', `${currentUser.uid}_${post.id}_repost`);
        const repostDoc = await getDoc(repostRef);
        if (repostDoc.exists()) {
          setHasReposted(true); // User has reposted this post
          setRepostedPostId(repostRef.id); // Store the reposted post ID
        } else {
          setHasReposted(false); // User hasn't reposted this post
          setRepostedPostId(null);
        }
      } catch (error) {
        console.error('Error checking repost status:', error);
      }
    };

    if (currentUser) {
      checkReposted();
    }
  }, [currentUser, post.id]);
  
  const handleProfileClick = () => {
    if (post.userid === currentUser?.uid) {
      // If the post is by the current user, navigate to their own profile page
      navigate('/profile');
    } else {
      // Otherwise, navigate to the clicked user's profile
      navigate(`/user/${post.userid}`);
    }
  };

  const formattedDate = new Date(post.date).toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles', // Adjust for desired timezone
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });

  return (
     <div className="post">
      <div className="postWrapper">
        <div className="postTop">
          <div className="postTopLeft">
            <span className="postUsername" onClick={handleProfileClick}>
              {post.isRepost ? `Reposted from ${post.originalUsername}` : post.username || 'Anonymous User'}
            </span>
            <span className="postDate">{formattedDate}</span>
          </div>
          <div className="postTopRight">
            {/* Show delete icon only if the current user is the post owner */}
            {!post.isRepost && currentUser?.uid === post.userid && (
              <i className="fas fa-trash-alt deleteIcon" onClick={deletePost}></i>
            )}
          </div>
        </div>
  
        <div className="postCenter">
          <span className="postText">{post?.desc || post.content}</span>
        </div>
  
        <div className="postBottom">
          <div className="postBottomLeft">
            <span className="likeText" onClick={likeHandler}>
              <i className="fas fa-thumbs-up"></i> {like}
            </span>
            <span className="dislikeText" onClick={dislikeHandler}>
              <i className="fas fa-thumbs-down"></i> {dislike}
            </span>
          </div>
          <div className="postBottomRight">
  <span className="postCommentText" onClick={() => setShowComments(!showComments)}>
    {comments.length} comments
  </span>
  <i 
    className={`fas fa-retweet repostIcon ${hasReposted ? 'reposted' : ''}`} 
    onClick={repostHandler}
  ></i>
  {/* Add undo repost icon if the post was reposted */}
  {hasReposted && (
    <i 
      className="fas fa-undo-alt undoRepostIcon" 
      onClick={repostHandler}
      title="Undo Repost"
    ></i>
  )}
</div>

          </div>
  
        {showComments && (
          <div className="commentsSection">
            <div className="commentsList">
              {comments.map((comment, index) => (
                <div key={index} className="commentItem">
                  <div className="commentTop">
                    <span className="commentUsername">{comment.username}</span>
                    {currentUser?.uid === comment.userId && (
                      <i className="fas fa-trash-alt deleteCommentIcon" onClick={() => deleteComment(index)}></i>
                    )}
                  </div>
                  <span className="commentText">{comment.text}</span>
                  <div className="commentActions">
                    <span className="likeText" onClick={() => likeComment(index)}>
                      <i className="fas fa-thumbs-up"></i> {comment.like}
                    </span>
                    <span className="dislikeText" onClick={() => dislikeComment(index)}>
                      <i className="fas fa-thumbs-down"></i> {comment.dislike}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="commentInputWrapper">
              <input
                type="text"
                placeholder="Add a comment..."
                className="commentInput"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                onKeyDown={handleKeyDown} // Enter key triggers add comment
              />
              <i className="fas fa-paper-plane sendIcon" onClick={addComment}></i>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
}