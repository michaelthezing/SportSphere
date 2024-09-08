import React from 'react';
import NavBar from './Components/navbar';
import LeftColumn from './Components/LeftColumn';
import MiddleColumn from './Components/MiddleColumn';
import RightColumn from './Components/RightColumn';


import './Homepage.css';

export default function HomePage() {

  return (
    <>
      <NavBar />
      <div className="homeContainer">
        <LeftColumn />
        <MiddleColumn />
        <RightColumn />
      </div>
    </>
  );
}
