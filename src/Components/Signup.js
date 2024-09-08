import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth function
import { auth, db } from '../firebase'; // Assuming you have db (Firestore) initialized in your firebase config
import { doc, setDoc } from 'firebase/firestore'; // Import Firestore function to save data
import './Signup.css'; // Assuming you save the styles in this file

export default function SignupPage() {
  const [username, setUsername] = useState(''); // Add state for username
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    // Validate fields
    if (!username || !email || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    try {
      // Create user with email and password in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save the username to Firestore or Realtime Database
      await setDoc(doc(db, 'users', user.uid), {
        username: username,
        email: email,
        password: password,
      });

      // Clear error message if successful
      setErrorMessage('');
      navigate('/');
    } catch (error) {
      setErrorMessage('Failed to sign up. Please try again.');
      console.error('Signup error:', error.code, error.message);
    }
  };

  return (
    <div className="mainContainer">
      <div className="titleContainer">
        <span>Sign Up</span>
      </div>
      <form onSubmit={handleSignup}>
        <div className="inputContainer">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="inputBox"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="inputContainer">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            className="inputBox"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="inputContainer">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            className="inputBox"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {errorMessage && <div className="errorLabel">{errorMessage}</div>}
        <div className="loginLink">
          <span>Already have an account? <Link to="/">Click here</Link> to log in</span>
        </div>
        <div className="buttonContainer">
          <button type="submit" className="signupButton">Sign Up</button>
        </div>
      </form>
    </div>
  );
}
