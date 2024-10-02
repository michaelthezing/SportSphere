import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"; // Import Firebase auth function
import { auth } from '../firebase';
import './Login.css'; 

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate hook

  const handleLogin = async (e) => {
    e.preventDefault();

    // Simple validation logic
    if (!email || !password) {
      setErrorMessage('Please fill in both fields.');
      return;
    }

    try {
      // Sign in with Firebase Authentication
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Logged in with:', { email, password });
      setErrorMessage('');

      // Navigate to home page after successful login
      navigate('/home');
    } catch (error) {
      // Handle login errors (invalid credentials, etc.)
      setErrorMessage('Failed to log in. Please check your credentials.');
      console.error('Login error', error);
    }
  };
  const handlePasswordReset = async () => {
    if (!email) {
      setErrorMessage('Please enter your email to reset your password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Password reset email sent. Check your inbox.');
      setErrorMessage(''); // Clear any error messages if reset is successful
    } catch (error) {
      setErrorMessage('Failed to send password reset email.');
      console.error('Password reset error', error);
    }
  };

  return (
    <div className="mainContainer">
      <div className="titleContainer">
        <span>Login</span>
      </div>
      <form onSubmit={handleLogin}>
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
        {resetMessage && <div className="resetLabel">{resetMessage}</div>}
        <div className="forgotPassword">
          <span onClick={handlePasswordReset}>Forgot your password?</span>
        </div>
        <div className="signupLink">
          <span>Don't have an account? <Link to="/signup">Click here</Link> to sign up</span>
        </div>
        <div className="buttonContainer">
          <button type="submit" className="loginButton">Login</button>
        </div>
      </form>
    </div>
  );
}
