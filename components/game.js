'use strict';

const log = require('./logger');
const eventBus = require('./eventBus');

class Game {
  constructor(id) {
    log.game(`Initializing new game: ${id}`);
    this.state = {
      id: id,
      baseRunners: { 1: null, 2: null, 3: null },
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
      inning: 1
    };
    this.info = {};
    return this;
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

  processPlay(inning, team, id, count, pitches, play) {
    console.log(play);
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
