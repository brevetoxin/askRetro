'use strict'

const log = require('./logger');
const eventBus = require('./eventBus');

const process = (gameState, basicPlay, modifiers, runnerResults) => {
  console.log(basicPlay, modifiers, runnerResults);
  if (basicPlay.match(/^[1-9]$/ && !modifiers.match(/^G$/))) flyBallOut(gameState, basicPlay, modifiers);
  if (basicPlay.match(/^[1-9]$/ && modifiers.match(/^G$/))) groundBallOut(gameState, basicPlay, modifiers);
  if (basicPlay.match(/^[1-9][1-9]+(\([1-3]\)|\(B\))?$/)) groundBallOut(gameState, basicPlay, modifiers);
}

const flyBallOut = (gameState, playInfo, modifiers, runnerResults) => {
  eventBus.trigger('flyBallOut', gameState, { playInfo, modifiers, runnerResults });
  advanceRunners(gameState, undefined, 'O', runnerResults);
}

const groundBallOut = (gameState, playInfo, modifiers) => {
  eventBus.trigger('groundBallOut', gameState, { playInfo, modifiers, runnerResults });
  let explicitOut;
  let implicitBatterPosition = 'O';
  if (playInfo.match(/\([1-3]\)|\(B\))/)) {
    explicitOut = playInfo.replace('(', '').replace(')', '');
  }
  advanceRunners(gameState, explicitOut, implicitBatterPosition, runnerResults);
}

const advanceRunners = (gameState, explicitOut, implicitBatterPosition, runnerResults) => {
  eventBus.trigger('advanceRunners', gameState, explicitOut, implicitBatterPosition, runnerResults);
}
