import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './Components/Login';
import HomePage from './homepage';
import SignupPage from './Components/Signup';
import ProfilePage from './Components/ProfilePage';

function App() {
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} /> 
        <Route path="/profile" element={<ProfilePage />} /> {/* Dynamic Profile Route */}
      </Routes>
    </Router>
  );
}

export default App;
