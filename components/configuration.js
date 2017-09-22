'use strict'

const configuration = require('../config/default.json');

const get = (key) => {
  if(configuration[key]) return configuration[key];
  return;
};

module.exports = {
  get
};
