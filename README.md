# askRetro
Experimental, customizable event driven retrosheet event file processor for developing applications that analyze historical major league baseball data.

Askretro traverses each event file line by line and maintains the state of the game as each event (play, substitution, etc) occurs. It also emits events to which users can subscribe using callbacks that process the current game state and event information.

## Installation

```
npm install askRetro
```

## Game state
AskRetro maintains the game state at all times. The state object contains the following fields:

Field | Description
----- | -----------
id | The retrosheet id of the game (eg, ANA201704070)
previousPlay | The play information from the previous line of the file
presentPlay | The play information from the line currently being processed
baseRunners | The baserunner object (see below)
lineups | The lineup objects (see below - 0 = visiting team, 1 = home team)
inning | The current inning
outs | The current number of outs
currentBatter | The retrosheet id of the current batter (eg., maybc001)
score | The score object (0 = visiting team, 1 = home team)
battingTeam | The team currently batting (0 = visiting team, 1 = home team)

#### baseRunners

Field | Description | Default
----- | ----------- | -------
0 | retrosheet id of the batter | N/A
1 | retrosheet id of the runner on first | null
2 | retrosheet id of the runner on | null
3 | retrosheet id of the runner on third | null

#### batting lineup
Field | Description | Default
----- | ----------- | -------
0 | retrosheet id of the pitcher when a designated hitter is used | null
1 | retrosheet id of the first batter
2 | retrosheet id of the second batter
3 | retrosheet id of the third batter
4 | retrosheet id of the fourth batter
5 | retrosheet id of the fifth batter
6 | retrosheet id of the sixth batter
7 | retrpsheet id of the seventh batter
8 | retrosheet id of the eight batter
9 | retrosheet id of the ninth batter

#### fielding lineup
Field | Description | Default
----- | ----------- | -------
1 | retrosheet id of the pitcher
2 | retrosheet id of the catcher
3 | retrosheet id of the first baseman
4 | retrosheet id of the second baseman
5 | retrosheet id of the third baseman
6 | retrosheet id of the shortstop
7 | retrosheet id of the left fielder
8 | retrosheet id of the center fielder
9 | retrosheet id of the right fielder
10 | retrosheet id of the designated hitter (if applicable)
11 | retrosheet id of a pinch hitter (when applicable)
12 | retrosheet id of a pinch runner (when applicable)

##### Example state object
```javascript
{
  id:'ANA201504120',
  previousPlay:{
    inning:2,
    team:0,
    id:'riosa002',
    count:'01',
    pitches:'CX',
    playInfo:'S9/L.1-2'
  },
  presentPlay:{
    inning:2,
    team:0,
    id:'peres002',
    count:'00',
    pitches:'X',
    playInfo:'S8/G.2-H;1-2'
  },
  baseRunners:{
    0:'peres002',
    1:'riosa002',
    2:'morak001',
    3:null
  },
  lineups:{
    0:{
      batting:{
        0:'venty001',
        1:'escoa003',
        2:'mousm001',
        3:'cainl001',
        4:'hosme001',
        5:'morak001',
        6:'riosa002',
        7:'peres002',
        8:'orlap001',
        9:'infao001'
      },
      fielding:{
        1:'venty001',
        2:'peres002',
        3:'hosme001',
        4:'infao001',
        5:'mousm001',
        6:'escoa003',
        7:'orlap001',
        8:'cainl001',
        9:'riosa002',
        10:'morak001'
      }
    },
    1:{
      batting:{
        0:'wilsc004',
        1:'aybae001',
        2:'troum001',
        3:'pujoa001',
        4:'joycm001',
        5:'freed001',
        6:'cronc002',
        7:'iannc001',
        8:'cowgc001',
        9:'featt001'
      },
      fielding:{
        1:'wilsc004',
        2:'iannc001',
        3:'pujoa001',
        4:'featt001',
        5:'freed001',
        6:'aybae001',
        7:'joycm001',
        8:'troum001',
        9:'cowgc001',
        10:'cronc002'
      }
    }
  },
  inning:2,
  outs:0,
  currentBatter:'peres002',
  score:{
    0:0,
    1:1
  },
  battingTeam:0
```

## Available events
newGame: triggered when a new game id is detected in the file, just before the game state is reset
newInning: triggered at the end of an inning just before the inning is reset in the game state
lineupChange: triggered once for each starter at the beginning of the game and again each time there is a substitution during the game.
processInfo: triggered when the processor encounters an 'info' line in the file
processStart: triggered when the processor encounters a 'start' line in the file
processPlay: triggered when the processor encounters a 'play' line in the file
processSub: triggered when the processor encounters a 'sub' line in the file
end: triggered at the end of the game
out: triggered whenever an out occurs
run: triggered whenever a run is scored
rbi: triggered whenever an rbi is credited to the hitter
advanceRunners: triggered just before runners advance on any given play
balk: triggered when the pitcher is charged with a balk
caughtStealing: triggered when a runner is caught stealing
defensiveIndifference: triggered when a runner is awarded a base due to defensive indifference
hit: triggered when the batter gets a hit (single, double, triple, home run)
hitByPitch: triggered when the batter is hit by a pitch
error: triggered when a fielding error occurs
flyBallOut: triggered when the batter hits into a fly ball out
groundBallOut: triggered when the batter hits into a ground ball out
otherAction: triggered when something strange happens
pickoff: triggered when a runner is picked off a base
stolenBase: triggered when a runner steals a base
strikeout: triggered when a batter strikes out
walk: triggered when a batter walks
wildPitch: triggered when a pitcher is charged with a wild pitch
beforeFileLoad: triggered just before a new file is loaded
afterFileLoad: triggered after a file loads


## Examples
### Walk through all games from 2017 and console log all homeruns
```javascript
'use strict';
const askRetro = require('askretro');

const startYear = 2017;
const endYear = 2017;

askRetro.configuration.configure({ startYear, endYear, loggingLevel: 'error' });

const logHomer = (hitter) => {
  console.log(`${hitter} just hit a home run!`);
}

const hit = (state, info) => {
  const play = info.playInfo;
  if (/^(H|HR)[1-9]*?$/.test(play)) logHomer(state.currentBatter);
};

askRetro.subscribe('hit', hit);

askRetro.processFiles()
  .then(() => {
    console.log('done');
  })
  .catch(err => {
    console.log(err);
  })
```
