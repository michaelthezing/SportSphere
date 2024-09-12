import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, startAt, endAt } from 'firebase/firestore';
import { db } from '../firebase'; // Import Firestore configuration
import './navbar.css';
import { debounce } from 'lodash'; // Import debounce from lodash

export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]); // State to hold suggested users
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // Function to handle searching users
  const handleSearch = async (event) => {
    if (event.key === 'Enter') {
      if (suggestions.length > 0) {
        // If suggestions exist, navigate to the first one
        navigate(`/user/${suggestions[0].id}`);
      }
      setSearchQuery('');
      setSuggestions([]); // Clear suggestions after search
    }
  };

  // Function to handle input changes and search suggestions
  const fetchSuggestions = async (queryText) => {
    try {
      if (queryText.trim() !== '') {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('username', '>=', queryText),
          where('username', '<=', queryText + '\uf8ff') // Search for usernames starting with queryText
        );
        const querySnapshot = await getDocs(q);
        const users = [];
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() }); // Collect matching users
        });
        setSuggestions(users); // Set suggestions for dropdown
      } else {
        setSuggestions([]); // Clear suggestions if searchQuery is empty
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  // Debounce the search input to prevent too many Firestore requests
  const debouncedFetchSuggestions = debounce((queryText) => fetchSuggestions(queryText), 300);

  // Handle input change and update suggestions
  const handleInputChange = (event) => {
    const queryText = event.target.value;
    setSearchQuery(queryText);
    debouncedFetchSuggestions(queryText); // Fetch suggestions with debounce
  };

  return (
    <header>
      <nav className="navbar">
        <div className="navbar-logo">
          <a href="/">SportSphere</a>
        </div>
        <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search hot takes"
            value={searchQuery}
            onChange={handleInputChange} // Update search query and fetch suggestions
            onKeyDown={handleSearch} // Handle "Enter" key search
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 100)} // Delay closing the suggestions
          />
          {isFocused && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((user) => (
                <li key={user.id} onClick={() => navigate(`/user/${user.id}`)}>
                  {user.username || 'Unknown User'}
                </li>
              ))}
            </ul>
          )}
        </div>
        <ul className="navbar-links">
          <li>
            <a href="/home">
              <i className="fas fa-home"></i>
            </a>
          </li>
          <li>
            <a href="/profile">
              <i className="fas fa-user"></i>
            </a>
          </li>
          <li>
            <a href="/contact">
              <i className="fas fa-envelope"></i>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
