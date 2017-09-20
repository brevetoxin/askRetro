'use strict';

const eventBus = require('./components/eventBus');
const config = require('./config/default.json');
const fileManager = require('./components/fileManager');

return fileManager.retrieveFiles()
  .then(files => {
    console.log(files);
  })

console.log(config);
