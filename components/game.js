'use strict';

const uuid = require('uuid/v4');
const log = require('./logger');
const eventBus = require('./eventBus');
const play = require('./play');
const Modifiers = require('./modifiers');



class Game {
  constructor(id) {
    log.game(`Initializing new game: ${id}`);
    this.state = {
      id: id,
      baseRunners: { 0: null, 1: null, 2: null, 3: null },
      lineups: {
        0: {
          batting: {},
          fielding: {}
        },
        1: {
          batting: {},
          fielding: {}
        }
      },
      inning: 1,
      outs: 0,
      currentBatter: null,
      score: {
        0: 0,
        1: 0
      },
      battingTeam: 0
    };
    this.info = {};
    return this;
  }

  resetInning(inning, team) {
    log.game(`New Inning: ${inning}. Batting team: ${team}`);
    eventBus.trigger('newInning', this.state, { inning });
    this.state.inning = inning;
    this.state.outs = 0;
    this.state.battingTeam = team;
    this.state.baseRunners = { 0: null, 1: null, 2: null, 3: null };
  }

  lineupChange(id, name, team, battingOrder, fieldingPosition) {
    eventBus.trigger('lineupChange', this.state, { id, team, battingOrder, fieldingPosition });
    this.state.lineups[team].batting[battingOrder] = id;
    this.state.lineups[team].fielding[fieldingPosition] = id;
  }

  processInfo(type, value) {
    eventBus.trigger('processInfo', this.state, { type, value });
    this.info[type] = value;
  }

  processStart(id, name, team, battingOrder, fieldingPosition) {
    eventBus.trigger('processStart', this.state, { id, name, team, battingOrder, fieldingPosition });
    this.lineupChange(id, name, team, battingOrder, fieldingPosition);
  }

  processSub(id, name, team, battingOrder, fieldingPosition) {
    eventBus.trigger('processSub', this.state, { id, name, team, battingOrder, fieldingPosition });
    this.lineupChange(id, name, team, battingOrder, fieldingPosition);
  }

  processPlay(inning, team, id, count, pitches, playInfo) {
    console.log(playInfo);
    if (inning !== this.state.inning || team !== this.state.battingTeam) this.resetInning(inning, team);
    this.state.currentPlay = uuid();
    this.state.currentBatter = id;
    eventBus.trigger('processPlay', this.state, { inning, team, id, count, pitches, playInfo });
    const playSplit1 = playInfo.split('.');
    const runnerResults = playSplit1[1];
    const playSplit2 = playSplit1[0].split(/\/(?![^(]*\))/);
    const basicPlay = playSplit2[0];
    const modifiers = new Modifiers(playSplit2.slice(1));
    play.processPlay(this.state, basicPlay, modifiers, runnerResults);
  }

  processLine(line) {
    const lineType = line[0];
    if (lineType === 'info') this.processInfo(line[1], line[2]);
    if (lineType === 'start') this.processStart(line[1], line[2], line[3], line[4], line[5]);
    if (lineType === 'sub') this.processSub(line[1], line[2], line[3], line[4], line[5]);
    if (lineType === 'play') this.processPlay(line[1], line[2], line[3], line[4], line[5], line[6]);
  }

  end() {
    log.game(`Finalizing ${this.state.id}`);
  }
};

module.exports = Game;
