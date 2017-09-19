'use strict';

const events = {};

const subscribe = (event, callback) => {
  events[event] = events[event] || [];
  events[event].push(callback);
};

const trigger = (event, state, data) => {
  events[event].forEach(callback => {
    return callback(state, data);
  });
};

const triggerAsync = (event, state, data) => {
  const eventPromises = events[event].map(callback => {
    return Promise.resolve(callback(state, data));
  });
  return Promise.all(eventPromises);
};

module.exports = {
  events,
  subscribe,
  trigger,
  triggerAsync
};
