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
      setFilterQuery(searchQuery);
      navigate('/home');
      setSearchQuery('');
      setSuggestions([]);
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
          where('username', '<=', queryText + '\uf8ff')
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });

        setSuggestions([`View "${queryText}" Posts`, ...users]);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const debouncedFetchSuggestions = debounce((queryText) => fetchSuggestions(queryText), 300);

  const handleInputChange = (event) => {
    const queryText = event.target.value;
    setSearchQuery(queryText);
    debouncedFetchSuggestions(queryText);
  };

  const handleSuggestionClick = (suggestion) => {
    if (typeof suggestion === 'string' && suggestion.includes('View')) {
      const searchTerm = suggestion.replace('View ', '').replace(' Posts', '');
      setFilterQuery(searchTerm);
      navigate('/home');
    } else if (suggestion.id) {
      navigate(`/user/${suggestion.id}`);
    }

    setSearchQuery('');
    setSuggestions([]);
  };

  return (
    <header>
      <nav className="navbar">
        <div className="navbar-logo">
          <a href="/">
            <div className="logo-circle">
              <span className="logo-text">SS</span>
            </div>
          </a>
        </div>
        <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search hot takes"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 100)}
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
            <a href="/message">
              <i className="fas fa-envelope"></i>
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
