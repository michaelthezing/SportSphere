import React, { useState, useEffect } from 'react';
import './LeftColumn.css';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBasketballBall, faFootballBall, faBaseballBall, faHockeyPuck, faChevronDown, faChevronRight, faUser, faBolt } from '@fortawesome/free-solid-svg-icons';

export default function LeftColumn() {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [expandNBA, setExpandNBA] = useState(false);
  const [expandNFL, setExpandNFL] = useState(false);
  const [expandMLB, setExpandMLB] = useState(false);
  const [expandNHL, setExpandNHL] = useState(false);
  const [expandFunTopics, setExpandFunTopics] = useState(false);
  const currentUser = auth.currentUser;

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
  const funNBATopics = [
    'MVP of the Year',            // Most Valuable Player of the season
    'Dunk of the Year',           // Best dunk of the year
    'Game-Winning Buzzer-Beater', // Most dramatic buzzer-beater win
    'Cross-Over of the Year',     // Most ankle-breaking cross-over
    'Posterized Dunk of the Year',// Best dunk over a defender
    'Breakout Star of the Year'   // Best breakout performance by a young player
  ];
  
  const funNFLTopics = [
    'MVP of the Year',             // Most Valuable Player of the season
    'One-Handed Catch of the Year',// Best one-handed catch
    'Hail Mary Play of the Year',  // Best long pass to win the game
    'Sack Master of the Year',     // Best sack or defensive play
    'Pick-Six of the Year',        // Best interception returned for a touchdown
    'Best Trick Play of the Year'  // Most creative trick play of the year
  ];
  
  const funMLBTopics = [
    'Grand Slam of the Year',      // Best grand slam of the year
    'Home Run Derby Champion',     // Most home runs hit during the All-Star event
    'Pitching Gem of the Year',    // Best pitching performance
    'Walk-Off Home Run',           // Best game-winning home run
    'Outfield Cannon of the Year', // Best long throw from the outfield to home plate
    'Bat Flip of the Year'         // Best celebratory bat flip after a home run
  ];
  
  const funNHLTopics = [
    'Hat Trick Hero of the Year',    // Best hat trick performance
    'Game-Winning Goal in OT',       // Most clutch goal in overtime
    'Goalie Save of the Year',       // Most epic save of the year
    'Best Power Play Goal',          // Best goal during a power play
    'Breakaway Speedster',           // Best breakaway play leading to a goal
    'Biggest Hit of the Year'        // Hardest check or hit of the season
  ];
  

  return (
    <div className="LeftColumn">
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
                <li key={index} className="subMenuItem"><a href={`/teams/nba/${team.toLowerCase().replace(/\s+/g, '-')}`}>{team}</a></li>
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
                <li key={index} className="subMenuItem"><a href={`/teams/nfl/${team.toLowerCase().replace(/\s+/g, '-')}`}>{team}</a></li>
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
                <li key={index} className="subMenuItem"><a href={`/teams/mlb/${team.toLowerCase().replace(/\s+/g, '-')}`}>{team}</a></li>
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
                <li key={index} className="subMenuItem"><a href={`/teams/nhl/${team.toLowerCase().replace(/\s+/g, '-')}`}>{team}</a></li>
              ))}
            </ul>
          )}
    
          {/* Fun Sport Topics */}
          <li className="menuItem" onClick={() => setExpandFunTopics(!expandFunTopics)}>
            <a href="#">
              <FontAwesomeIcon icon={faBolt}/> Fun Sport Topics
              <FontAwesomeIcon icon={expandFunTopics ? faChevronDown : faChevronRight} className="chevron-icon" />
            </a>
          </li>
          {expandFunTopics && (
            <ul className="subMenuList">
              {/* NBA Fun Topics */}
              <li className="subMenuTitle">NBA Topics</li>
              {funNBATopics.map((topic, index) => (
                <li key={index} className="subMenuItem"><a href={`/fun/nba/${topic.toLowerCase().replace(/\s+/g, '-')}`}>{topic}</a></li>
              ))}
              <div className="menuSeparator"></div>
  
              {/* NFL Fun Topics */}
              <li className="subMenuTitle">NFL Topics</li>
              {funNFLTopics.map((topic, index) => (
                <li key={index} className="subMenuItem"><a href={`/fun/nfl/${topic.toLowerCase().replace(/\s+/g, '-')}`}>{topic}</a></li>
              ))}
              <div className="menuSeparator"></div>
  
              {/* MLB Fun Topics */}
              <li className="subMenuTitle">MLB Topics</li>
              {funMLBTopics.map((topic, index) => (
                <li key={index} className="subMenuItem"><a href={`/fun/mlb/${topic.toLowerCase().replace(/\s+/g, '-')}`}>{topic}</a></li>
              ))}
              <div className="menuSeparator"></div>
  
              {/* NHL Fun Topics */}
              <li className="subMenuTitle">NHL Topics</li>
              {funNHLTopics.map((topic, index) => (
                <li key={index} className="subMenuItem"><a href={`/fun/nhl/${topic.toLowerCase().replace(/\s+/g, '-')}`}>{topic}</a></li>
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
              <a href={`/players/nba/${player.toLowerCase().replace(/\s+/g, '-')}`}>{player}</a>
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
              <a href={`/players/nfl/${player.toLowerCase().replace(/\s+/g, '-')}`}>{player}</a>
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
              <a href={`/players/mlb/${player.toLowerCase().replace(/\s+/g, '-')}`}>{player}</a>
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
              <a href={`/players/nhl/${player.toLowerCase().replace(/\s+/g, '-')}`}>{player}</a>
            </div>
          ))}
        </div>
        </div>
      </div>
    </div>
  );
  
}
