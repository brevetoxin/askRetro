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
    return this;
  }

  processLine(line) {
    console.log(line);
  }

  end() {
    log.game(`Finalizing ${this.state.id}`);
  }
};

module.exports = Game;
