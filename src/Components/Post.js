import React, { useState, useEffect } from 'react';
import { doc, updateDoc, deleteDoc, arrayUnion, addDoc, collection, getDoc, arrayRemove, setDoc, query,getDocs} from 'firebase/firestore'; // Import Firestore methods
import { db, auth } from '../firebase'; // Import Firebase config and auth
import './Post.css';
import { Link,useNavigate } from 'react-router-dom';


export default function Post({ post, onDelete }) { // onDelete is a callback to dynamically remove the post from the UI
  const [like, setLike] = useState(post.like || 0);
  const [dislike, setDislike] = useState(post.dislike || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);  // Ensure comments are stored in state


  

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



// Inside your component
const fetchComments = async () => {
  try {
    const commentsRef = collection(db, 'posts', post.id, 'comments');  // Correct path to the comments subcollection
    const q = query(commentsRef);  // You can use queries if needed (e.g., sort by date)
    const querySnapshot = await getDocs(q);

    const commentsList = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setComments(commentsList);  // Set state with fetched comments

  } catch (error) {
    console.error('Error fetching comments:', error);
  }
};

// Call fetchComments when component loads
useEffect(() => {
  fetchComments();
}, [post.id]);  // Ensure it runs when post.id changes


const addComment = async () => {
  if (commentInput.trim() !== '') {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      let displayName = userDoc.exists() ? userDoc.data().username : currentUser.email;

      const newComment = {
        text: commentInput,
        username: displayName,
        like: 0,
        dislike: 0,
        userId: currentUser.uid,
        createdAt: new Date(),
      };

      const commentsRef = collection(db, 'posts', post.id, 'comments');
      await addDoc(commentsRef, newComment);

      // Re-fetch comments after adding a new one
      fetchComments();
      setCommentInput('');  // Clear input after posting

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

  const deleteComment = async (commentId) => {
    try {
      // Reference to the specific comment in the subcollection
      const commentRef = doc(db, 'posts', post.id, 'comments', commentId);
  
      // Delete the comment from Firestore
      await deleteDoc(commentRef);
  
      // Re-fetch the comments after deleting one to update the UI
      fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };
  
  
  
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
              {post.username || 'Anonymous User'}
            </span>
            <span className="postDate">{formattedDate}</span>
          </div>
          <div className="postTopRight">
            {currentUser?.uid === post.userid && (
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
          </div>
        </div>
  
        {showComments && (
          <div className="commentsSection">
            <div className="commentsList">
              {comments.map((comment) => (
                <div key={comment.id} className="commentItem">
                  <div className="commentTop">
                    <span className="postUsername" onClick={handleProfileClick}>
                      {comment.username || 'Anonymous User'}
                    </span>
                    {currentUser?.uid === comment.userId && (
                      <i className="fas fa-trash-alt deleteCommentIcon" onClick={() => deleteComment(comment.id)}></i>
                    )}
                  </div>
                  <div className="commentText">{comment.text}</div>
                  <div className="commentActions">
                    <span className="likeText" onClick={() => likeComment(comment.id)}>
                      <i className="fas fa-thumbs-up"></i> {comment.like}
                    </span>
                    <span className="dislikeText" onClick={() => dislikeComment(comment.id)}>
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
                onKeyDown={handleKeyDown}  // Enter key triggers add comment
              />
              <i className="fas fa-paper-plane commentSendIcon" onClick={addComment}></i>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}