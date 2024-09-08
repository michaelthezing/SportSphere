import React, { useState } from 'react';
import './navbar.css';

function NavBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      // Handle the search action here, like sending the query to a backend API
      console.log('Searching for:', searchQuery);
      // Reset the search bar
      setSearchQuery('');
    }
  };

  return (
    <header>
      <nav className="navbar">
        <div className="navbar-logo">
          <a href="/">Hot Takes</a>
        </div>
        <div className={`search-bar ${isFocused ? 'focused' : ''}`}>
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Search hot takes"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
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

export default NavBar;
