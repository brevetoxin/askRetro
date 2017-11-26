'use strict';

const eventBus = require('./components/eventBus');
const configuration = require('./components/configuration');
const fileManager = require('./components/fileManager');
const processor = require('./components/processor');
const log = require('./components/logger');

const processFiles = () => {
  log.transports.console.level = configuration.config.loggingLevel || 'play';
  return fileManager.retrieveFiles(configuration.config)
    .then(files => {
      const filePromises = files.map(file => processor.processFile(file));
      return Promise.all(filePromises);
    })
    .catch(err => {
      log.error(err);
    });
};

module.exports = {
  subscribe: eventBus.subscribe,
  configuration,
  processFiles
};
