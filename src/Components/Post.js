import React, { useState } from 'react';
import { doc, updateDoc, deleteDoc, arrayUnion, addDoc, collection, getDoc} from 'firebase/firestore'; // Import Firestore methods
import { db, auth } from '../firebase'; // Import Firebase config and auth
import './Post.css';

export default function Post({ post, onDelete }) { // onDelete is a callback to dynamically remove the post from the UI
  const [like, setLike] = useState(post.like || 0);
  const [dislike, setDislike] = useState(post.dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [comments, setComments] = useState(post.comments || []);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);
  const [hasReposted, setHasReposted] = useState(false);

  const postRef = doc(db, 'posts', post.id); // Get a reference to the post in Firestore

  const currentUser = auth.currentUser; // Get the current authenticated user

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
      const repostedPost = {
        content: post?.desc || post.content,
        username: post.username, // Keep the original post author's name
        originalAuthor: post.username, // Store the original author separately for display
        date: new Date().toISOString(),
        userid: currentUser.uid, // Logged-in user's ID
        like: 0,
        dislike: 0,
        comments: [],
        isRepost: true, // Flag to indicate it's a repost
        originalPostId: post.id, // Reference to the original post
        originalUsername: post.username, // Original post's username
      };
  
      // Add reposted post to the user's profile in Firestore
      await addDoc(collection(db, 'posts'), repostedPost);
  
      await updateDoc(postRef, {
        repostCount: repostCount + 1, // Increment repost count
        repostedBy: arrayUnion(currentUser.uid), // Track who reposted
      });

      setRepostCount(repostCount + 1);
      setHasReposted(true);
      console.log('Post successfully reposted!');
    } catch (error) {
      console.error('Error reposting post:', error);
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
            {/* Display the original author's name if it's a repost */}
            <span className="postUsername">
              {post.isRepost ? `Reposted from ${post.originalUsername}` : post.username || 'Anonymous User'}
            </span>
            <span className="postDate">{formattedDate}</span>
          </div>
          <div className="postTopRight">
            {/* Show the trash can icon only if the current user is the post owner and it’s not a repost */}
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
            {/* Add the retweet icon for reposting */}
            <i className={`fas fa-retweet repostIcon ${hasReposted ? 'disabled' : ''}`} onClick={repostHandler}></i>
            <span className="repostCount">{repostCount}</span> {/* Display the repost count */}
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