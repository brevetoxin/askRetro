'use strict';

const fileManager = require('./fileManager');
const eventBus = require('./eventBus');
const log = require('./logger');
const Game = require('./game');

const process = (fileContents) => {
  const fileLines = fileContents.split(/\r?\n/);
  let game;
  while (fileLines.length > 0) {
    const line = fileLines.shift();
    const lineParts = line.split(',');
    if (lineParts[0] === 'id') {
      if (game) game.end();
      game = new Game(lineParts[1]);
    } else if (game) game.processLine(lineParts);
  }
  game.end();
}

const processFile = (filename) => {
  let fileData = '';
  log.processor(`Triggering beforeFileLoad event`);
  return eventBus.triggerAsync('beforeFileLoad', {}, { filename })
    .then(() => {
      log.processor(`Retrieving contents of ${filename}`);
      return fileManager.getContents(filename);
    })
    .then(data => {
      fileData = data;
      log.processor(`Triggering afterFileLoad event`);
      return eventBus.trigger('afterFileLoad', {}, { fileData });
    })
    .then(() => {
      log.file(`Processing ${filename}`);
      return process(fileData);
    })
};

module.exports = {
  processFile
};
