'use strict';

const events = {};

const subscribe = (event, callback) => {
  events[event] = events[event] || [];
  events[event].push(callback);
};

const trigger = (event, state, data) => {
  if (events[event]) {
    events[event].forEach(callback => {
      callback(state, data);
    });
  }
};

const triggerAsync = (event, state, data) => {
  let eventPromises = [];
  if (events[event]) {
    eventPromises = events[event].map(callback => {
      return Promise.resolve(callback(state, data));
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
