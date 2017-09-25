'use strict';

const log = require('./logger');
const eventBus = require('./eventBus');

class Game {
  constructor(id) {
    log.game(`Initializing new game: ${id}`);
    this.state = {
      id: id,
      baseRunners: { 1: null, 2: null, 3: null },
      inning: 1
    };
    this.info = {};
    return this;
  }

  processInfo(type, value) {
    this.info[type] = value;
  }

  processLine(line) {
    const lineType = line[0];
    if (lineType === 'info') this.processInfo(line[1], line[2]);
    console.log(this.info);
  }

  end() {
    log.game(`Finalizing ${this.state.id}`);
  }
};

module.exports = Game;
