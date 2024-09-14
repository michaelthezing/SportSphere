import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom'; // Import useLocation
import NavBar from './Components/navbar';
import LoginPage from './Components/Login';
import SignupPage from './Components/Signup';
import HomePage from './homepage';
import ProfilePage from './Components/ProfilePage';
import UserProfilePage from './Components/UserProfilePage';
import FollowingPage from './Components/FollowingPage';
import FollowersPage from './Components/FollowersPage';

function App() {
  const [filterQuery, setFilterQuery] = useState('');
  const location = useLocation(); // Get current route

  // Conditionally render NavBar for all pages except login and signup
  const showNavBar = location.pathname !== '/' && location.pathname !== '/signup';

  return (
    <>
      {showNavBar && <NavBar setFilterQuery={setFilterQuery} />}
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/user/:userId" element={<UserProfilePage />} />
        <Route
          path="/home"
          element={<HomePage filterQuery={filterQuery} setFilterQuery={setFilterQuery} />}
        />
        <Route path="/user/:userId/followers" element={<FollowersPage />} />
        <Route path="/user/:userId/following" element={<FollowingPage />} />
      </Routes>
    </>
  );
}

export default App;
