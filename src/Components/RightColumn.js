import React from 'react';
import './RightColumn.css';

export default function RightColumn() {
  return (
    <div className="RightColumn">
      <div className="trendingSection">
        <h3 className="trendingTitle"> NBA Topics</h3>
        <ul className="trendingList">
          <li className="trendingItem">#LeBron</li>
          <li className="trendingItem">#Durant</li>
          <li className="trendingItem">#Curry</li>
          <li className="trendingItem">#Jordan</li>
        </ul>
      </div>
      <div className="adSection">
      </div>
    </div>
  );
}
