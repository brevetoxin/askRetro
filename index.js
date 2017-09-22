'use strict';

const eventBus = require('./components/eventBus');
const config = require('./config/default.json');
const fileManager = require('./components/fileManager');
const processor = require('./components/processor');
const log = require('./components/logger');

return fileManager.retrieveFiles()
  .then(files => {
    const filePromises = files.map(file => processor.processFile(file));
    return Promise.all(filePromises)
  })
  .catch(err => {
    log.error(err);
  })
