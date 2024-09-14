import React, {useState} from 'react';
import NavBar from './Components/navbar';
import LeftColumn from './Components/LeftColumn';
import MiddleColumn from './Components/MiddleColumn';
import RightColumn from './Components/RightColumn';



import './Homepage.css';

export default function HomePage({ filterQuery, setFilterQuery }) {
  const [currentThread, setCurrentThread] = useState('main');  // Default to main thread
  return (
    <>

      <div className="homeContainer">
      <LeftColumn setFilterQuery={setFilterQuery} setCurrentThread={setCurrentThread} />
      <MiddleColumn filterQuery={filterQuery} currentThread={currentThread} />
        <RightColumn />
      </div>
    </>
  );
}
