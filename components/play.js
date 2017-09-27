'use strict'

const log = require('./logger');
const eventBus = require('./eventBus');

const process = (gameState, basicPlay, modifiers, runnerResults) => {
  if basicPlay.match(/^[1-9]$/) flyBallOut(gameState, basicPlay, modifiers, runnerResults);
  advanceRunners(gameState, runnerResults);
}

const flyBallOut = (gameState, playInfo, modifiers) => {
  eventBus.trigger('flyBallOut', gameState, { playInfo, modifiers });
  gameState.outs ++;
}

const advanceRunners = (gameState, runnerResults) => {
  eventBus.trigger('advanceRunners', gameState, runnerresults);
}
