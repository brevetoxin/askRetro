'use strict';

const log = require('./logger');
const eventBus = require('./eventBus');

const processPlay = (gameState, basicPlay, modifiers, runnerResults) => {
  gameState.baseRunners[0] = gameState.currentBatter;
  basicPlay = basicPlay.replace(/!/g, '');
  basicPlay = basicPlay.replace(/\?/g, '');
  basicPlay = basicPlay.replace(/#/g, '');
  if (/^[1-9](\(([1-9]|B)*\))?$/.test(basicPlay) && !modifiers.check(/^FO$/) && !modifiers.check(/^G(\+|-)?$/)) flyBallOut(gameState, basicPlay, modifiers, runnerResults); // eg. 8/F78 (fly ball out)
  else if (/^[1-9]$/.test(basicPlay) && modifiers.check(/^G(\+|-)?$/)) groundBallOut(gameState, basicPlay, modifiers, runnerResults); // eg. 3/G (ground ball out)
  else if (/^[1-9]\(([1-3]|H)\)$/.test(basicPlay) && !modifiers.check(/^DP$/) && (modifiers.check(/^G(\+|-)?$/) || modifiers.check(/^FO$/))) groundBallOut(gameState, basicPlay, modifiers, runnerResults); // eg., 6(1) (force out)
  else if (/^[1-9][1-9]+(\([1-3]\)|\(B\))?$/.test(basicPlay) && !modifiers.check(/^DP$/)) groundBallOut(gameState, basicPlay, modifiers, runnerResults); // eg. 63/G  (ground ball out)
  else if (modifiers.check(/^GDP$/) || (modifiers.check(/^DP$/) && !/^K([1-9]*)?(\+.*)?$/.test(basicPlay) && !/(CS([2-3]|H)|POCS([2-3]|H))(\([1-9]*E*[1-9]*(\/TH)?\))?(\(UR\))?$/.test(basicPlay))) groundBallOut(gameState, basicPlay, modifiers, runnerResults, 2); // eg., 64(1)3/GDP/G6 (ground into double play)
  else if (modifiers.check(/^LDP$/) || (modifiers.check(/^BPDP$/)) || (modifiers.check(/^FDP$/))) flyBallOut(gameState, basicPlay, modifiers, runnerResults); // eg. 8(B)84(2)/LDP/L8 (lined into double play)
  else if (modifiers.check(/^LTP$/)) flyBallOut(gameState, basicPlay, modifiers, runnerResults); // eg. 1(B)16(2)63(1)/LTP/L1 (lined into triple play)
  else if (modifiers.check(/^GTP$/) || (modifiers.check(/^TP$/))) groundBallOut(gameState, basicPlay, modifiers, runnerResults); // eg., 6(2)4(1)3/GTP/G6 (ground into triple play)
  else if (/^C$/.test(basicPlay)) fieldingError(gameState, basicPlay, modifiers, runnerResults, 1); // eg., C/E2 (interference)
  else if (/^S[0-9]*\+?$/.test(basicPlay)) hit(gameState, basicPlay, modifiers, runnerResults, 1); // eg., S5 (single)
  else if (/^D[0-9]*$/.test(basicPlay)) hit(gameState, basicPlay, modifiers, runnerResults, 2);// eg., D9 (double)
  else if (/^T[0-9]*$/.test(basicPlay)) hit(gameState, basicPlay, modifiers, runnerResults, 3); // eg., T8 (triple)
  else if (/^DGR[0-9]*$/.test(basicPlay)) hit(gameState, basicPlay, modifiers, runnerResults, 2); // eg., DGR/L9LS.2-H (ground rule double)
  else if (/^[1-9]*E[1-9]*$/.test(basicPlay)) fieldingError(gameState, basicPlay, modifiers, runnerResults, 1); // eg., E1/TH/BG15.1-3 (fielding error)
  else if (/^FC[1-9]?$/.test(basicPlay)) groundBallOut(gameState, basicPlay, modifiers, runnerResults, 1, 1); // eg., FC5/G5.3XH(52) (fielder's choice)
  else if (/^FLE[1-9]$/.test(basicPlay)) fieldingError(gameState, basicPlay, modifiers, runnerResults, null); // eg., FLE5/P5F (error on foul fly ball)
  else if (/^(H|HR)[1-9]*?$/.test(basicPlay)) hit(gameState, basicPlay, modifiers, runnerResults, 4); // eg., H/L7D (home run)
  else if (/^HP$/.test(basicPlay)) hitByPitch(gameState, basicPlay, modifiers, runnerResults, 1); // eg., HP (hit by pitch)
  else if (/^K([1-9]*)?(\+.*)?$/.test(basicPlay)) strikeout(gameState, basicPlay, modifiers, runnerResults); // eg., K (strikeout)
  else if (/^(W|IW|I)(\+.*)?$/.test(basicPlay)) walk(gameState, basicPlay, modifiers, runnerResults); // eg., IW (walk)
  else if (/^BK$/.test(basicPlay)) balk(gameState, basicPlay, modifiers, runnerResults); // eg., BK (balk)
  else if (/^(CS([2-3]|H)|POCS([2-3]|H))(\([1-9]*E*[1-9]*(\/TH)?\))?(\(UR\))?$/.test(basicPlay)) caughtStealing(gameState, basicPlay, modifiers, runnerResults); // eg., CS2 (caught stealing)
  else if (/^DI$/.test(basicPlay)) defensiveIndifference(gameState, basicPlay, modifiers, runnerResults); // eg., DI (defensive Indifference)
  else if (/^OA$/.test(basicPlay)) otherAction(gameState, basicPlay, modifiers, runnerResults); // eg., OA (misc)
  else if (/^(PB|WP)$/.test(basicPlay)) wildPitch(gameState, basicPlay, modifiers, runnerResults); // eg., PB (passed ball or wild pitch)
  else if (/^(PO)[1-3](\(.*\))?$/.test(basicPlay)) pickOff(gameState, basicPlay, modifiers, runnerResults); // eg., POCS2(24) (picked off)
  else if (/^SB([2-3]|H(\(T?UR\))?)(;SB([2-3]|H(\(UR\))?))*$/.test(basicPlay)) stolenBase(gameState, basicPlay, modifiers, runnerResults); // eg., SB2 (stolen base);
  else if (/^NP$/.test(basicPlay)) {
    /* do nothing */
  } else {
    log.play('Something else', basicPlay);
    process.exit();
  }
};

const byRunner = (a, b) => {
  if (a.runner > b.runner) return -1;
  if (a.runner < b.runner) return 1;
  return 0;
};

const getRunnerEvents = (runnerResults) => runnerResults ? runnerResults.split(';') : [];

const runnerResultsAreExplicit = (runnerResults, runner) => {
  const runnerEvents = getRunnerEvents(runnerResults);
  if (runnerEvents.find(event => Number(event[0]) === runner)) return true;
  return false;
};

const recordOut = (gameState, runner, outAt) => {
  eventBus.trigger('out', gameState, { runner });
  gameState.outs++;
};

const runScored = (gameState, runner, earned) => {
  eventBus.trigger('run', gameState, { runner, earned });
  gameState.score[gameState.battingTeam]++;
};

const explicitOuts = (playInfo) => {
  const outGroups = playInfo.match(/\([1-3]\)|\(B\)/g);
  let runnersOut = [];
  if (outGroups) {
    runnersOut = outGroups.map(group => group[1]);
  }
  return runnersOut;
};

const errorOnPlay = (playInfo) => /\([1-9]*E[1-9]*(\/TH)?\)/.test(playInfo);

const getNumberOfStrikes = (pitches) => {
  let strikes = 0;
  for (let i = 0; i < pitches.length; i++) {
    if (pitches[i] === 'C' || pitches[i] === 'K' || pitches[i] === 'Q' || pitches[i] === 'S') strikes++;
    if ((pitches[i] === 'F' || pitches[i] === 'L' || pitches[i] === 'M' || pitches[i] === 'O' || pitches[i] === 'T') && strikes < 2) strikes++;
  }
  return strikes;
};

const batterCharged = (previousPlay) => {
  if (previousPlay && !/^NP$/.test(previousPlay.playInfo)) return null;
  if (previousPlay && getNumberOfStrikes(previousPlay.pitches) !== 2) return null;
  return previousPlay ? previousPlay.id : null;
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
  const runnerEvents = getRunnerEvents(runnerResults);
  const withoutDupes = runnerEvents.filter((event, index, self) => {
    return self.indexOf(event) === index;
  });
  const rawEvents = withoutDupes.map(event => {
    let earned = true;
    if (/\(UR\)/.test(event)) earned = false;
    const errorNegatingOut = /([1-3]|B)X([1-3]|H)(\((NR|UR)\))*\([1-9]*E[1-9]*\)/.test(event);
    const runner = event[0] === 'B' ? 0 : Number(event[0]);
    const out = event[1] === 'X' && !errorNegatingOut;
    const finalBase = event[2] === 'H' ? 4 : Number(event[2]);
    return {
      runner,
      out,
      finalBase,
      earned
    };
  });
  const events = rawEvents.filter((event, index, self) => {
    const sameBaseEvents = rawEvents.filter(event2 => event2.runner === event.runner);
    if (sameBaseEvents < 2) return true;
    let furthestBase = 0;
    sameBaseEvents.forEach(event2 => {
      if (event2.finalBase > furthestBase) furthestBase = event2.finalBase;
    });
    if (event.finalBase === furthestBase) return true;
    return false;
  });
  events.sort(byRunner);
  events.forEach(event => {
    if (gameState.baseRunners[event.runner] === null) {
      log.error(`Expected a runner at ${event.runner} but found null`);
      process.exit();
    }
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

const balk = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Balk: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('balk', gameState, { playInfo, modifiers, runnerResults });
  advanceRunners(gameState, [], null, runnerResults);
};

const caughtStealing = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Caught Stealing: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('caughtStealing', gameState, { playInfo, modifiers, runnerResults });
  let targetBase;
  if (playInfo[2] === 'C') targetBase = playInfo[4] === 'H' ? 4 : Number(playInfo[4]);
  else targetBase = playInfo[2] === 'H' ? 4 : Number(playInfo[2]);
  if (!errorOnPlay(playInfo)) {
    recordOut(gameState, targetBase - 1, targetBase);
    gameState.baseRunners[targetBase - 1] = null;
  } else {
    if (!runnerResultsAreExplicit(runnerResults, targetBase - 1)) {
      if (runnerResults && runnerResults.length > 0) runnerResults += `;${targetBase - 1}-${targetBase}`;
      else runnerResults = `${targetBase - 1}-${targetBase}`;
    }
  }
  advanceRunners(gameState, [], null, runnerResults);
};

const defensiveIndifference = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Defensive Indifference: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('defensiveIndifference', gameState, { playInfo, modifiers, runnerResults });
  advanceRunners(gameState, [], null, runnerResults);
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
  eventBus.trigger('error', gameState, { playInfo, modifiers, runnerResults });
  advanceRunners(gameState, [], implicitBatterPosition, runnerResults);
};

const flyBallOut = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Fly ball out: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('flyBallOut', gameState, { playInfo, modifiers, runnerResults });
  const explicitRunnersOut = explicitOuts(playInfo);
  advanceRunners(gameState, explicitRunnersOut, 0, runnerResults);
};

const groundBallOut = (gameState, playInfo, modifiers, runnerResults, totalOuts, implicitBatterPosition) => {
  implicitBatterPosition = implicitBatterPosition || 0;
  log.play(`Ground ball out: ${playInfo}`);
  totalOuts = totalOuts || 1;
  eventBus.trigger('groundBallOut', gameState, { playInfo, modifiers, runnerResults, totalOuts });
  // Check for an explicit out
  const explicitRunnersOut = explicitOuts(playInfo);
  const runnerEvents = getRunnerEvents(runnerResults);
  let runnersOut = 0;
  runnerEvents.forEach(event => {
    if (event[1] === 'X') runnersOut++;
  });
  if ((explicitRunnersOut.length + runnersOut) >= totalOuts) implicitBatterPosition = 1;
  advanceRunners(gameState, explicitRunnersOut, implicitBatterPosition, runnerResults);
};

const otherAction = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Other Action: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('otherAction', gameState, { playInfo, modifiers, runnerResults });
  advanceRunners(gameState, [], null, runnerResults);
};

const pickOff = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Pick Off: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('pickoff', gameState, { playInfo, modifiers, runnerResults });
  let base = playInfo[2] === 'H' ? 4 : Number(playInfo[2]);
  if (!errorOnPlay(playInfo)) {
    if (runnerResults && runnerResults.length > 0) runnerResults += `;${base}X${base}`;
    else runnerResults = `${base}X${base}`;
  }
  advanceRunners(gameState, [], null, runnerResults);
};

const stolenBase = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Stolen Base: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('stolenBase', gameState, { playInfo, modifiers, runnerResults });
  const stolenBases = playInfo.split(';');
  stolenBases.forEach(stolenBase => {
    const base = stolenBase[2] === 'H' ? 4 : Number(stolenBase[2]);
    let sbString = `${base - 1}-${base}`;
    if (/\(UR\)/.test(stolenBase)) sbString = `${sbString}(UR)`;
    if (!runnerResultsAreExplicit(runnerResults, base - 1)) {
      if (runnerResults && runnerResults.length > 0) runnerResults = `${sbString};${runnerResults}`;
      else runnerResults = sbString;
    }
  });
  advanceRunners(gameState, [], null, runnerResults);
};

const strikeout = (gameState, playInfo, modifiers, runnerResults) => {
  let implicitBatterPosition = 0;
  const chargedBatter = batterCharged(gameState.previousPlay) || gameState.currentBatter;
  log.play(`Strikeout: ${playInfo}`);
  eventBus.trigger('strikeout', gameState, { playInfo, chargedBatter, modifiers, runnerResults });
  const additionalPlays = playInfo.split('+');
  if (additionalPlays.length > 1) processPlay(gameState, additionalPlays[1], modifiers, runnerResults);
  else advanceRunners(gameState, [], implicitBatterPosition, runnerResults);
};

const walk = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Walk: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('walk', gameState, { playInfo, modifiers, runnerResults });
  const additionalPlays = playInfo.split('+');
  if (additionalPlays.length > 1) {
    if (runnerResults && runnerResults.length > 0) runnerResults += `;B-1`;
    else runnerResults = 'B-1';
    processPlay(gameState, additionalPlays[1], modifiers, runnerResults);
  } else advanceRunners(gameState, [], 1, runnerResults);
};

const wildPitch = (gameState, playInfo, modifiers, runnerResults) => {
  log.play(`Wild Pitch or Passed Ball: ${playInfo}|${modifiers.mods}|${runnerResults}`);
  eventBus.trigger('wildPitch', gameState, { playInfo, modifiers, runnerResults });
  advanceRunners(gameState, [], null, runnerResults);
};

module.exports = {
  advanceRunners,
  explicitOuts,
  processPlay
};
