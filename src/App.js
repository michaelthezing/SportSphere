import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Components/Login';
import HomePage from './homepage';
import SignupPage from './Components/Signup';
import ProfilePage from './Components/ProfilePage';
import UserProfilePage from './Components/UserProfilePage';
import FollowingPage from './Components/FollowingPage';
import FollowersPage from './Components/FollowersPage';


function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} /> 
        <Route path="/profile" element={<ProfilePage />} /> {/* Dynamic Profile Route */}
        <Route path="/user/:userId" element={<UserProfilePage />} /> {/* Dynamic User Profile Route */}
        <Route path="/user/:userId/followers" element={<FollowersPage />} /> {/* Route for followers */}
        <Route path="/user/:userId/following" element={<FollowingPage />} /> {/* Route for following */}
      </Routes>
    </Router>
  );
}

export default App;
