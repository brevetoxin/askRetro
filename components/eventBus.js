'use strict';

const _ = require('lodash');

const events = {};

const subscribe = (event, callback) => {
  events[event] = events[event] || [];
  events[event].push(callback);
};

const trigger = (event, state, data) => {
  if (events[event]) {
    events[event].forEach(callback => {
      callback(_.cloneDeep(state), _.cloneDeep(data));
    });
  }
};

const triggerAsync = (event, state, data) => {
  let eventPromises = [];
  if (events[event]) {
    eventPromises = events[event].map(callback => {
      return Promise.resolve(callback(_.cloneDeep(state), _.cloneDeep(data)));
    });
  }
  return Promise.all(eventPromises);
};

module.exports = {
  events,
  subscribe,
  trigger,
  triggerAsync
};
