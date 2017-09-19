const chai = require('chai');
const expect = chai.expect;
const eventBus = require('../components/eventBus');

describe('EventBus', () => {
  describe('subscribe', () => {
    it ('Adds the appropriate callback to the events object', () => {
      const callback = (state, data) => { return { state, data } };
      eventBus.subscribe('testSingleCallback', callback);
      expect(eventBus.events['testSingleCallback'].length).to.equal(1);
      expect(eventBus.events['testSingleCallback'][0]({ test: 'single' }, 'dummy').state.test).to.equal('single');
      expect(eventBus.events['testSingleCallback'][0]({ test: 'single' }, 'dummy').data).to.equal('dummy');
    });
    it ('Adds multiple callbacks to the events object', () => {
      const callback1 = (state, data) => { return { state, data } };
      const callback2 = (state, data) => { return 'two' };
      eventBus.subscribe('testCallback1', callback1);
      eventBus.subscribe('testCallback1', callback2);
      eventBus.subscribe('testCallback2', callback1);
      expect(eventBus.events['testCallback1'].length).to.equal(2);
      expect(eventBus.events['testCallback2'].length).to.equal(1);
      expect(eventBus.events['testCallback1'][0]({ test: 'single' }, 'dummy').state.test).to.equal('single');
      expect(eventBus.events['testCallback1'][1]({ test: 'single' }, 'dummy')).to.equal('two');
      expect(eventBus.events['testCallback2'][0]({ test: 'single' }, 'dummy').state.test).to.equal('single');
    });
  });
  describe('trigger', () => {
    it ('Triggers the appropriate callbacks', () => {
      let testA = 1;
      let testB = 2;
      let testC = 3;
      const callback1 = (state, data) => testA = 11;
      const callback2 = (state, data) => testB = 22;
      const callback3 = (state, data) => testC = 33;
      eventBus.events.test1 = [callback1, callback2];
      eventBus.events.test2 = [callback3];
      eventBus.trigger('test1', {}, {});
      expect(testA).to.equal(11);
      expect(testB).to.equal(22);
      expect(testC).to.equal(3);
    });
  });
  describe('TriggerAsync', () => {
    it('Handles callbacks that return a promise', () => {
      const callback = (state, data) => Promise.resolve(state);
      eventBus.events.test = [callback];
      eventBus.triggerAsync('test', 'myAnswer')
        .then(result => {
          expect(result.length).to.equal(1);
          expect(result[0]).to.equal('myAnswer');
        });
    });
    it('Handles callbacks that do not return a promise', () => {
      const callback = (state, data) => state;
      eventBus.events.test = [callback];
      eventBus.triggerAsync('test', 'myAnswer')
        .then(result => {
          expect(result.length).to.equal(1);
          expect(result[0]).to.equal('myAnswer');
        });
    });
  })
});
