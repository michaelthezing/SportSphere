import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase'; // Import Firestore configuration
import './navbar.css';
import { debounce } from 'lodash'; // Import debounce from lodash

export default function NavBar({ setFilterQuery }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]); // State to hold suggested users and posts suggestion
  const [isFocused, setIsFocused] = useState(false);
  const navigate = useNavigate();

  // Function to handle searching users
  const handleSearch = async (event) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      // Navigate to home page with filter query set
      setFilterQuery(searchQuery);  // Set the filter query
      navigate('/home');            // Navigate to the home page
      setSearchQuery('');           // Clear search query after
      setSuggestions([]);           // Clear suggestions after search
    }
  };

  // Function to handle input changes and search suggestions
  const fetchSuggestions = async (queryText) => {
    try {
      const users = [];
      if (queryText.trim() !== '') {
        const usersRef = collection(db, 'users');
        const q = query(
          usersRef,
          where('username', '>=', queryText),
          where('username', '<=', queryText + '\uf8ff') // Search for usernames starting with queryText
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() }); // Collect matching users
        });

        // Add "View [Name] Posts" suggestion at the top of the list
        setSuggestions([`View ${queryText} Posts`, ...users]);
      } else {
        setSuggestions([]);
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

  // Handle suggestion click to either navigate to user or filter posts
  const handleSuggestionClick = (suggestion) => {
    if (typeof suggestion === 'string' && suggestion.includes('View')) {
      // Handle the post filtering suggestion
      const searchTerm = suggestion.replace('View ', '').replace(' Posts', '');
      setFilterQuery(searchTerm);      // Set the filter query
      navigate('/home');              // Ensure navigation to home page for filtering
    } else if (suggestion.id) {
      // Handle user profile navigation
      navigate(`/user/${suggestion.id}`);
    }

    setSearchQuery('');
    setSuggestions([]); // Clear suggestions
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
            onKeyDown={handleSearch} // Handle "Enter" key search and navigate to home
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 100)} // Delay closing the suggestions
          />
          {isFocused && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                  {typeof suggestion === 'string' ? suggestion : suggestion.username || 'Unknown User'}
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
