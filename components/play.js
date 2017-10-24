'use strict'

const log = require('./logger');
const eventBus = require('./eventBus');

const process = (gameState, basicPlay, modifiers, runnerResults) => {
  if (/^[1-9]$/.test(basicPlay) && !modifiers.check(/^G$/)) flyBallOut(gameState, basicPlay, modifiers, runnerResults);
  if (/^[1-9]$/.test(basicPlay) && modifiers.check(/^G$/)) groundBallOut(gameState, basicPlay, modifiers, runnerResults);
  if (/^[1-9][1-9]+(\([1-3]\)|\(B\))?$/.test(basicPlay)) groundBallOut(gameState, basicPlay, modifiers, runnerResults);
}

const byRunner = (a, b) => {
  if (a.runner > b.runner) return -1;
  if (a.runner < b.runner) return 1;
  return 0;
};

const recordOut(gameState, runner, outAt) => {
  eventBus.trigger('out', gameState, { runner });
  gameState.outs++;
};

const explicitOuts = (playInfo) => {
  const outGroups = playInfo.match(/\([1-3]\)|\(B\)/g);
  let runnersOut = [];
  if (outGroups) {
    runnersOut = outGroups.map(group => group[1]);
  }
  return runnersOut;
};

const advanceRunners = (gameState, explicitOuts, implicitBatterPosition, runnerResults) {
  // Process the explicit outs
  // Process the runner runnerResults
  // Figure out if the implicitBattePosition is needed and process it.
  explicitOuts.forEach(runner => {
    let outAt = 1;
    if (runner !== 'B') {
      const currentRunner = Number(runner);
      outAt = currentRunner + 1;
      gameState.baseRunners[currentRunner] = null;
    } else if (runner === 'B' && implicitBatterPosition === 0) {
      implicitBatterPosition = null;
      runner = 0;
    }
    recordOut(gameState, runner, outAt);
  });
  const runnerEvents = runnerResults ? runnerResults.split(';') : [];
  const events = runnerEvents.map(event => {
    let earned = true;
    if (/\(UR\)/.test(event)) earned = false;
    const runner = event[0] === 'B' ? 0 : Number(event[0]);
    const out = event[1] === 'X';
    const finalBase = event[2] === 'H' ? 4 : Number(event[2]);
    return {
      runner,
      out,
      finalBase,
      earned
    };
  });
  events.sort(byRunner);
  events.forEach(event => {
    if (event.out) {
      recordOut(gameState, event.runner, event.finalBase);
    } else {
      if (event.finalBase === 4) {
        runScored(gameState, event.runner, event.earned);
      } else {
        gameState.baseRunners[event.finalBase] = gameState.baseRunners[event.runner];
      }
    }
  });
  if (implictBatterPosition !== null) {
    if (implicitBatterPosition === 0) recordOut(gameState, 0, 1);
    else {
      if (implicitBatterPosition === 4) runScored(gameState, 0, true);
      else {
        gameState.baseRunners[implicitBatterPosition] = gameState.currentBatter;
      }
    }
  }
}

const flyBallOut = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Fly ball out: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('flyBallOut', gameState, { playInfo, modifiers, runnerResults });
  advanceRunners(gameState, undefined, 'O', runnerResults);
}

const groundBallOut = (gameState, playInfo, modifiers, runnerResults, totalOuts) => {
  const implicitBatterPosition = 0;
  log.play(`Ground ball out: ${playInfo}`);
  totalOuts = totalOuts || 1;
  eventBus.trigger('groundBallOut', gameState, { playInfo, modifiers, runnerResults });
  // Check for an explicit out
  const explicitRunnersOut = explicitOuts(playInfo);
  advanceRunners(gameState, explicitRunnersOut, implicitBatterPosition, runnerResults);
}

const advanceRunners = (gameState, explicitOut, implicitBatterPosition, runnerResults) => {
  eventBus.trigger('advanceRunners', gameState, explicitOut, implicitBatterPosition, runnerResults);
}

module.exports = {
  process,
  explicitOuts
}
