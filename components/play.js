'use strict'

const log = require('./logger');
const eventBus = require('./eventBus');

const process = (gameState, basicPlay, modifiers, runnerResults) => {
  gameState.baseRunners[0] = gameState.currentBatter;
  if (/^[1-9]$/.test(basicPlay) && !modifiers.check(/^G$/)) flyBallOut(gameState, basicPlay, modifiers, runnerResults); // eg. 8/F78 (fly ball out)
  else if (/^[1-9]$/.test(basicPlay) && modifiers.check(/^G$/)) groundBallOut(gameState, basicPlay, modifiers, runnerResults); // eg. 3/G (ground ball out)
  else if (/^[1-9][1-9]+(\([1-3]\)|\(B\))?$/.test(basicPlay)) groundBallOut(gameState, basicPlay, modifiers, runnerResults); // eg. 63/G  (ground ball out)
  else if (modifiers.check(/^GDP$/)) groundBallOut(gameState, basicPlay, modifiers, runnerResults, 2); //eg., 64(1)3/GDP/G6 (ground into double play)
  else if (modifiers.check(/^LDP$/)) flyBallOut(gameState, basicPlay, modifiers, runnerResults); // eg. 8(B)84(2)/LDP/L8 (lined into double play)
  else if (modifiers.check(/^LTP$/)) flyBallOut(gameState, basicPlay, modifiers, runnerResults); // eg. 1(B)16(2)63(1)/LTP/L1 (lined into triple play)
  else if (modifiers.check(/^GTP$/)) groundBallOut(gameState, basicPlay, modifiers, runnerResults); // eg., 6(2)4(1)3/GTP/G6 (ground into triple play)
  else if (/^C$/.test(basicPlay)) fieldingError(gameState, basicPlay, modifiers, runnerResults, 1); //eg., C/E2 (interference)
  else if (/^S[1-9]*$/.test(basicPlay)) hit(gameState, basicPlay, modifiers, runnerResults, 1); // eg., S5 (single)
  else if (/^D[1-9]*$/.test(basicPlay)) hit(gameState, basicPlay, modifiers, runnerResults, 2);// eg., D9 (double)
  else if (/^T[1-9]*$/.test(basicPlay)) hit(gameState, basicPlay, modifiers, runnerResults, 3); // eg., T8 (triple)
  else if (/^DGR$/.test(basicPlay)) hit(gameState, basicPlay, modifiers, runnerResults, 2); // eg., DGR/L9LS.2-H (ground rule double)
  else if (/^E[1-9]$/.test(basicPlay)) fieldingError(gameState, basicPlay, modifiers, runnerResults, 1); // eg., E1/TH/BG15.1-3 (fielding error)
  else if (/^FC[1-9]$/.test(basicPlay)) groundBallOut(gameState, basicPlay, modifiers, runnerResults, 1); //eg., FC5/G5.3XH(52) (fielder's choice)
  else if (/^FLE[1-9]$/.test(basicPlay)) fieldingError(gameState, basicPlay, modifiers, runnerResults, null); //eg., FLE5/P5F (error on foul fly ball)
  else if (/^(H|HR)[1-9]?$/.test(basicPlay)) hit(gameState, basicPlay, modifiers, runnerResults, 4); //eg., H/L7D (home run)
  else if (/^HP$/.test(basicPlay)) hitByPitch(gameState, basicPlay, modifiers, runnerResults, 1); //eg., HP (hit by pitch)
  else if (/^K[1-9]*$/.test(basicPlay)) strikeout(gameState, basicPlay, modifiers, runnerResults); //eg., K (strikeout)
  else if (/^K\+(SB([2-3]|H)|CS([2-3]|H)|WP|OA|PO[1-3]|PB|E[1-9])$/.test(basicPlay)) strikeout(gameState, basicPlay, modifiers, runnerResults); //eg. K+WP (strikeout plus event)
  else if (/^W|IW?$/.test(basicPlay)) walk(gameState, basicPlay, modifiers, runnerResults); //eg., IW (walk)
  else if (/^NP$/.test(basicPlay)) { }
  else {
    log.play('Something else', basicPlay);
    process.exit();
  }
}

const byRunner = (a, b) => {
  if (a.runner > b.runner) return -1;
  if (a.runner < b.runner) return 1;
  return 0;
};

const recordOut = (gameState, runner, outAt) => {
  eventBus.trigger('out', gameState, { runner });
  gameState.outs++;
};

const runScored = (gameState, runner, earned) => {
  eventBus.trigger('run', gameState, { runner, earned });
  gameState.score[gameState.battingTeam] ++;
}

const explicitOuts = (playInfo) => {
  const outGroups = playInfo.match(/\([1-3]\)|\(B\)/g);
  let runnersOut = [];
  if (outGroups) {
    runnersOut = outGroups.map(group => group[1]);
  }
  return runnersOut;
};

const advanceRunners = (gameState, explicitOuts, implicitBatterPosition, runnerResults) => {
  eventBus.trigger('advanceRunners', gameState, explicitOuts, implicitBatterPosition, runnerResults);
  explicitOuts.forEach(runner => {
    let outAt = 1;
    if (runner !== 'B') {
      const currentRunner = Number(runner);
      outAt = currentRunner + 1;
    } else {
      implicitBatterPosition = null;
      runner = 0;
    }
    gameState.baseRunners[runner] = null;
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
    if (event.runner === 0) implicitBatterPosition = null;
    if (event.out) {
      recordOut(gameState, event.runner, event.finalBase);
      gameState.baseRunners[event.runner] = null;
    } else {
      if (event.finalBase === 4) {
        runScored(gameState, event.runner, event.earned);
        gameState.baseRunners[event.runner] = null;
      } else {
        gameState.baseRunners[event.finalBase] = gameState.baseRunners[event.runner];
        if (event.finalBase !== event.runner) gameState.baseRunners[event.runner] = null;
      }
    }
  });
  if (implicitBatterPosition !== null) {
    if (implicitBatterPosition === 0) recordOut(gameState, 0, 1);
    else {
      if (implicitBatterPosition === 4) runScored(gameState, 0, true);
      else {
        gameState.baseRunners[implicitBatterPosition] = gameState.baseRunners[0];
      }
    }
  }
};

const hit = (gameState, playInfo, modifiers, runnerResults, implicitBatterPosition) => {
  log.play(`Hit: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('hit', gameState, { playInfo, modifiers, runnerResults, implicitBatterPosition });
  advanceRunners(gameState, [], implicitBatterPosition, runnerResults);
};

const hitByPitch = (gameState, playInfo, modifiers, runnerResults, implicitBatterPosition) => {
  log.play(`Hit By Pitch: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('hitByPitch', gameState, { playInfo, modifiers, runnerResults, implicitBatterPosition });
  advanceRunners(gameState, [], implicitBatterPosition, runnerResults);
};

const fieldingError = (gameState, playInfo, modifiers, runnerResults, implicitBatterPosition) => {
  log.play(`Fielding Error: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('interference', gameState, { playInfo, modifiers, runnerResults });
  advanceRunners(gameState, [], implicitBatterPosition, runnerResults);
};

const flyBallOut = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Fly ball out: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('flyBallOut', gameState, { playInfo, modifiers, runnerResults });
  const explicitRunnersOut = explicitOuts(playInfo);
  advanceRunners(gameState, explicitRunnersOut, 0, runnerResults);
};

const groundBallOut = (gameState, playInfo, modifiers, runnerResults, totalOuts) => {
  let implicitBatterPosition = 0;
  log.play(`Ground ball out: ${playInfo}`);
  totalOuts = totalOuts || 1;
  eventBus.trigger('groundBallOut', gameState, { playInfo, modifiers, runnerResults, totalOuts });
  // Check for an explicit out
  const explicitRunnersOut = explicitOuts(playInfo);
  if (explicitRunnersOut.length === totalOuts) implicitBatterPosition = 1;
  advanceRunners(gameState, explicitRunnersOut, implicitBatterPosition, runnerResults);
};

const strikeout = (gameState, playInfo, modifiers, runnerResults) => {
  let implicitBatterPosition = 0;
  log.play(`Strikeout: ${playInfo}`);
  eventBus.trigger('strikeout', gameState, { playInfo, modifiers, runnerResults });
  advanceRunners(gameState, [], implicitBatterPosition, runnerResults);
};

const walk = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Walk: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('walk', gameState, { playInfo, modifiers, runnerResults });
  advanceRunners(gameState, [], 1, runnerResults);
};

module.exports = {
  advanceRunners,
  explicitOuts,
  process
}
