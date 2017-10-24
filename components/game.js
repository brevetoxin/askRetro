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
      outs: 0
    };
    this.info = {};
    return this;
  }

  resetInning(inning) {
    eventBus.trigger('newInning', this.state, { inning });
    this.state.inning = inning;
    this.state.outs = 0;
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
    if (inning !== this.state.inning) this.resetInning(inning);
    this.state.currentPlay = uuid();
    eventBus.trigger('processPlay', this.state, { inning, team, id, count, pitches, playInfo });
    const playSplit1 = playInfo.split('.');
    const runnerResults = playSplit1[1];
    const playSplit2 = playSplit1[0].split('/');
    const basicPlay = playSplit2[0];
    const modifiers = new Modifiers(playSplit2.slice(1));
    play.process(this.state, basicPlay, modifiers, runnerResults);
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
