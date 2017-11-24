'use strict';

const appRoot = require('app-root-path');

const defaultResourcePath = `${appRoot}/node_modules/askretro/resources`;

const config = {
  resourcePath: defaultResourcePath
};

const get = (key) => {
  if (config[key]) return config[key];
};

const configure = (params) => {
  config.resourcePath = params.resourcePath || defaultResourcePath;
  config.startYear = params.startYear || '';
  config.endYear = params.endYear || '';
  config.team = params.team || '';
  config.league = params.league || '';
};

const set = (key, value) => {
  config[key] = value;
};

module.exports = {
  get,
  set,
  configure,
  config
};
