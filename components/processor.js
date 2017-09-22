'use strict';

const fileManager = require('./fileManager');

const processFile = (filename) => {
  return fileManager.getContents(filename)
    .then(data => {
      console.log(data);
    });
};

module.exports = {
  processFile
};
