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
lineups | The lineup object (see below)
inning | The current inning
outs | The current number of outs
currentBatter | The retrosheet id of the current batter (eg., maybc001)
score | The score object (see below)
battingTeam | The team currently batting

#### baseRunners

Field | Description | Default
----- | ----------- | -------
0 | the batter | N/A
1 | runner on first | null
2 | runner on | null
3 | runner on third | null


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
