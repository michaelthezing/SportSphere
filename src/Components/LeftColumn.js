import React, { useState, useEffect } from 'react';
import './LeftColumn.css';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBasketballBall, faFootballBall, faBaseballBall, faHockeyPuck, faChevronDown, faChevronRight, faUser, faBolt } from '@fortawesome/free-solid-svg-icons';

export default function LeftColumn({setFilterQuery}) {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [expandNBA, setExpandNBA] = useState(false);
  const [expandNFL, setExpandNFL] = useState(false);
  const [expandMLB, setExpandMLB] = useState(false);
  const [expandNHL, setExpandNHL] = useState(false);
  const [expandFunTopics, setExpandFunTopics] = useState(false);
  const [expandMenu, setExpandMenu] = useState(false); // State to handle the expansion of the left column
  const currentUser = auth.currentUser;
  const handleNameClick = (name) => {
    setFilterQuery(name); // Update the filter query in the MiddleColumn
  };
  useEffect(() => {
    if (currentUser) {
      const fetchUserProfile = async () => {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUsername(userData.name || 'Sports Fan');
            setName(`@${userData.username || 'sportsfan123'}`);
          } else {
            console.error('No user profile found.');
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      };

      fetchUserProfile();
    }
  }, [currentUser]);

  // NBA Teams
  const nbaTeams = [
    'Atlanta Hawks', 'Boston Celtics', 'Brooklyn Nets', 'Charlotte Hornets', 'Chicago Bulls', 
    'Cleveland Cavaliers', 'Dallas Mavericks', 'Denver Nuggets', 'Detroit Pistons', 
    'Golden State Warriors', 'Houston Rockets', 'Indiana Pacers', 'LA Clippers', 
    'Los Angeles Lakers', 'Memphis Grizzlies', 'Miami Heat', 'Milwaukee Bucks', 
    'Minnesota Timberwolves', 'New Orleans Pelicans', 'New York Knicks', 'Oklahoma City Thunder', 
    'Orlando Magic', 'Philadelphia 76ers', 'Phoenix Suns', 'Portland Trail Blazers', 
    'Sacramento Kings', 'San Antonio Spurs', 'Toronto Raptors', 'Utah Jazz', 'Washington Wizards'
  ];

  // NFL Teams
  const nflTeams = [
    'Arizona Cardinals', 'Atlanta Falcons', 'Baltimore Ravens', 'Buffalo Bills', 'Carolina Panthers', 
    'Chicago Bears', 'Cincinnati Bengals', 'Cleveland Browns', 'Dallas Cowboys', 'Denver Broncos', 
    'Detroit Lions', 'Green Bay Packers', 'Houston Texans', 'Indianapolis Colts', 'Jacksonville Jaguars', 
    'Kansas City Chiefs', 'Las Vegas Raiders', 'Los Angeles Chargers', 'Los Angeles Rams', 
    'Miami Dolphins', 'Minnesota Vikings', 'New England Patriots', 'New Orleans Saints', 
    'New York Giants', 'New York Jets', 'Philadelphia Eagles', 'Pittsburgh Steelers', 
    'San Francisco 49ers', 'Seattle Seahawks', 'Tampa Bay Buccaneers', 'Tennessee Titans', 
    'Washington Commanders'
  ];

  // MLB Teams
  const mlbTeams = [
    'Arizona Diamondbacks', 'Atlanta Braves', 'Baltimore Orioles', 'Boston Red Sox', 'Chicago Cubs', 
    'Chicago White Sox', 'Cincinnati Reds', 'Cleveland Guardians', 'Colorado Rockies', 
    'Detroit Tigers', 'Houston Astros', 'Kansas City Royals', 'Los Angeles Angels', 
    'Los Angeles Dodgers', 'Miami Marlins', 'Milwaukee Brewers', 'Minnesota Twins', 
    'New York Mets', 'New York Yankees', 'Oakland Athletics', 'Philadelphia Phillies', 
    'Pittsburgh Pirates', 'San Diego Padres', 'San Francisco Giants', 'Seattle Mariners', 
    'St. Louis Cardinals', 'Tampa Bay Rays', 'Texas Rangers', 'Toronto Blue Jays', 'Washington Nationals'
  ];

  // NHL Teams
  const nhlTeams = [
    'Anaheim Ducks', 'Arizona Coyotes', 'Boston Bruins', 'Buffalo Sabres', 'Calgary Flames', 
    'Carolina Hurricanes', 'Chicago Blackhawks', 'Colorado Avalanche', 'Columbus Blue Jackets', 
    'Dallas Stars', 'Detroit Red Wings', 'Edmonton Oilers', 'Florida Panthers', 'Los Angeles Kings', 
    'Minnesota Wild', 'Montreal Canadiens', 'Nashville Predators', 'New Jersey Devils', 
    'New York Islanders', 'New York Rangers', 'Ottawa Senators', 'Philadelphia Flyers', 
    'Pittsburgh Penguins', 'San Jose Sharks', 'Seattle Kraken', 'St. Louis Blues', 
    'Tampa Bay Lightning', 'Toronto Maple Leafs', 'Vancouver Canucks', 'Vegas Golden Knights', 
    'Washington Capitals', 'Winnipeg Jets'
  ];

  // Notable Players
  const nbaPlayers = [
    'LeBron James', 'Stephen Curry', 'Kevin Durant', 'Giannis Antetokounmpo', 
    'Luka Dončić', 'James Harden', 'Kawhi Leonard', 'Joel Embiid'
  ];
  const nflPlayers = [
    'Tom Brady', 'Patrick Mahomes', 'Aaron Rodgers', 'Lamar Jackson', 
    'Derrick Henry', 'Tyreek Hill', 'Travis Kelce', 'Aaron Donald'
  ];
  const mlbPlayers = [
    'Mike Trout', 'Mookie Betts', 'Aaron Judge', 'Bryce Harper', 
    'Shohei Ohtani', 'Freddie Freeman', 'Fernando Tatis Jr.', 'Jacob deGrom'
  ];
  const nhlPlayers = [
    'Sidney Crosby', 'Alex Ovechkin', 'Connor McDavid', 'Patrick Kane', 
    'Nathan MacKinnon', 'Auston Matthews', 'Leon Draisaitl', 'Carey Price'
  ];
  

  return (
    <>
      {/* Hamburger Menu */}
      <div className="hamburger-menu" onClick={() => setExpandMenu(!expandMenu)}>
        &#9776; {/* Hamburger Icon */}
      </div>
  
      {/* Left Column */}
      <div className={`LeftColumn ${expandMenu ? 'active' : ''}`}>
        <div className="profileSection">
          <h3 className="profile-username">{username}</h3>
          <p className="profile-name">{name}</p>
        </div>
  
        <div className="menuSection">
          <ul className="menuList">
            {/* NBA */}
            <li className="menuItem" onClick={() => setExpandNBA(!expandNBA)}>
              <a href="#">
                <FontAwesomeIcon icon={faBasketballBall} /> NBA
                <FontAwesomeIcon icon={expandNBA ? faChevronDown : faChevronRight} className="chevron-icon" />
              </a>
            </li>
            {expandNBA && (
              <ul className="subMenuList">
                <li className="subMenuTitle">Teams</li>
                {nbaTeams.map((team, index) => (
                  <li key={index} className="subMenuItem">
                    <a href="#" onClick={() => handleNameClick(team)}>{team}</a>
                  </li>
                ))}
              </ul>
            )}
  
            {/* NFL */}
            <li className="menuItem" onClick={() => setExpandNFL(!expandNFL)}>
              <a href="#">
                <FontAwesomeIcon icon={faFootballBall} /> NFL
                <FontAwesomeIcon icon={expandNFL ? faChevronDown : faChevronRight} className="chevron-icon" />
              </a>
            </li>
            {expandNFL && (
              <ul className="subMenuList">
                <li className="subMenuTitle">Teams</li>
                {nflTeams.map((team, index) => (
                  <li key={index} className="subMenuItem">
                    <a href="#" onClick={() => handleNameClick(team)}>{team}</a>
                  </li>
                ))}
              </ul>
            )}
  
            {/* MLB */}
            <li className="menuItem" onClick={() => setExpandMLB(!expandMLB)}>
              <a href="#">
                <FontAwesomeIcon icon={faBaseballBall} /> MLB
                <FontAwesomeIcon icon={expandMLB ? faChevronDown : faChevronRight} className="chevron-icon" />
              </a>
            </li>
            {expandMLB && (
              <ul className="subMenuList">
                <li className="subMenuTitle">Teams</li>
                {mlbTeams.map((team, index) => (
                  <li key={index} className="subMenuItem">
                    <a href="#" onClick={() => handleNameClick(team)}>{team}</a>
                  </li>
                ))}
              </ul>
            )}
  
            {/* NHL */}
            <li className="menuItem" onClick={() => setExpandNHL(!expandNHL)}>
              <a href="#">
                <FontAwesomeIcon icon={faHockeyPuck} /> NHL
                <FontAwesomeIcon icon={expandNHL ? faChevronDown : faChevronRight} className="chevron-icon" />
              </a>
            </li>
            {expandNHL && (
              <ul className="subMenuList">
                <li className="subMenuTitle">Teams</li>
                {nhlTeams.map((team, index) => (
                  <li key={index} className="subMenuItem">
                    <a href="#" onClick={() => handleNameClick(team)}>{team}</a>
                  </li>
                ))}
              </ul>
            )}
          </ul>
  
          {/* Notable Players Section */}
          <div className="playersSection">
            {/* NBA Players */}
            <div className="playersList">
              <h4 className="sectionTitle">Notable NBA Players Takes</h4>
              {nbaPlayers.map((player, index) => (
                <div key={index} className="playerItem">
                  <FontAwesomeIcon icon={faUser} className="playerIcon" />
                  <a href="#" onClick={() => handleNameClick(player)}>{player}</a>
                </div>
              ))}
            </div>
            <div className="menuSeparator"></div>
  
            {/* NFL Players */}
            <div className="playersList">
              <h4 className="sectionTitle">Most Notable NFL Players Takes</h4>
              {nflPlayers.map((player, index) => (
                <div key={index} className="playerItem">
                  <FontAwesomeIcon icon={faUser} className="playerIcon" />
                  <a href="#" onClick={() => handleNameClick(player)}>{player}</a>
                </div>
              ))}
            </div>
            <div className="menuSeparator"></div>
  
            {/* MLB Players */}
            <div className="playersList">
              <h4 className="sectionTitle">Notable MLB Players Takes</h4>
              {mlbPlayers.map((player, index) => (
                <div key={index} className="playerItem">
                  <FontAwesomeIcon icon={faUser} className="playerIcon" />
                  <a href="#" onClick={() => handleNameClick(player)}>{player}</a>
                </div>
              ))}
            </div>
            <div className="menuSeparator"></div>
  
            {/* NHL Players */}
            <div className="playersList">
              <h4 className="sectionTitle">Notable NHL Players Takes</h4>
              {nhlPlayers.map((player, index) => (
                <div key={index} className="playerItem">
                  <FontAwesomeIcon icon={faUser} className="playerIcon" />
                  <a href="#" onClick={() => handleNameClick(player)}>{player}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}  