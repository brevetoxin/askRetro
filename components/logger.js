'use srrict';

const configuration = require('./configuration');
const winston = require('winston');

const loggingLevels = {
  error: 1,
  processor: 3,
  file: 5,
  game: 7,
  play: 9
};

const colors = {
  error: 'red',
  processor: 'yellow',
  file: 'blue',
  game: 'white',
  play: 'green'
};

winston.addColors(colors);

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({ colorize: true, level: configuration.loggingLevel || 'play' })
  ],
  levels: loggingLevels
});

module.exports = logger;
