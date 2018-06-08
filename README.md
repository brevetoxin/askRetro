# askRetro
Experimental, customizable event driven retrosheet event file processor for developing applications that analyze historical major league baseball data.

## Installation

```
npm install askRetro
```

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
