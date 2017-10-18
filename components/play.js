'use strict'

const log = require('./logger');
const eventBus = require('./eventBus');

const process = (gameState, basicPlay, modifiers, runnerResults) => {
  if (/^[1-9]$/.test(basicPlay) && !modifiers.check(/^G$/)) flyBallOut(gameState, basicPlay, modifiers, runnerResults);
  if (/^[1-9]$/.test(basicPlay) && modifiers.check(/^G$/)) groundBallOut(gameState, basicPlay, modifiers, runnerResults);
  if (/^[1-9][1-9]+(\([1-3]\)|\(B\))?$/.test(basicPlay)) groundBallOut(gameState, basicPlay, modifiers, runnerResults);
}

const explicitOuts = (playInfo) => {
  const outGroups = playInfo.match(/\([1-3]\)|\(B\)/g);
  let runnersOut = [];
  if (outGroups) {
    runnersOut = outGroups.map(group => group[1]);
  }
  return runnersOut;
};

const flyBallOut = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Fly ball out: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('flyBallOut', gameState, { playInfo, modifiers, runnerResults });
  advanceRunners(gameState, undefined, 'O', runnerResults);
}

const groundBallOut = (gameState, playInfo, modifiers, runnerResults, totalOuts) => {
  log.play(`Ground ball out: ${playInfo}`);
  totalOuts = totalOuts || 1;
  eventBus.trigger('groundBallOut', gameState, { playInfo, modifiers, runnerResults });
  // Check for an expclit out
  if (/\([1-3]\)|\(B\)/.test(playInfo)) //There is an explicit out
  advanceRunners(gameState, explicitOut, implicitBatterPosition, runnerResults);
}

const advanceRunners = (gameState, explicitOut, implicitBatterPosition, runnerResults) => {
  eventBus.trigger('advanceRunners', gameState, explicitOut, implicitBatterPosition, runnerResults);
}

module.exports = {
  process,
  explicitOuts
}
