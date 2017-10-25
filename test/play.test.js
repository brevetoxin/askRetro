'use strict';

const play = require('../components/play');
const chai = require('chai');
const expect = chai.expect;

describe.only('play', () => {
  describe('explicitOuts', () => {
    it('Returns correct out when there is one explicit out', () => {
      const playInfo = '26(2)';
      const result = play.explicitOuts(playInfo);
      expect(result.length).to.equal(1);
      expect(result[0]).to.equal('2');
    });
    it('Returns correct outs when there are two explicit outs', () => {
      const playInfo = '26(2)4(1)';
      const result = play.explicitOuts(playInfo);
      expect(result.length).to.equal(2);
      expect(result[0]).to.equal('2');
      expect(result[1]).to.equal('1');
    });
    it('Returns correct outs when there are three explicit outs', () => {
      const playInfo = '62(3)6(2)4(1)';
      const result = play.explicitOuts(playInfo);
      expect(result.length).to.equal(3);
      expect(result[0]).to.equal('3');
      expect(result[1]).to.equal('2');
      expect(result[2]).to.equal('1');
    });
    it('Returns correct outs when there are no explicit outs', () => {
      const playInfo = '63';
      const result = play.explicitOuts(playInfo);
      expect(result.length).to.equal(0);
    });
  });
  describe('advanceRunners', () => {
    let gameState = {};
    beforeEach(() => {
      gameState = {
        baseRunners: { 0: 'bob', 1: null, 2: null, 3: null },
        outs: 0,
        score: {
          0: 0,
          1: 0
        },
        battingTeam: 0
      };
    });
    it('Handles explicit out at second on a ground ball out', () => {
      gameState.baseRunners[1] = 'jim';
      const result = play.advanceRunners(gameState, ['1'], 1, '');
      expect(gameState.outs).to.equal(1);
      expect(gameState.baseRunners[2]).to.equal(null);
      expect(gameState.baseRunners[1]).to.equal('bob');
    });
    it('Handles explicit outs at second and third on a ground ball out', () => {
      gameState.baseRunners[1] = 'jim';
      gameState.baseRunners[2] = 'john';
      const result = play.advanceRunners(gameState, ['1', '2'], 1, '');
      expect(gameState.outs).to.equal(2);
      expect(gameState.baseRunners[2]).to.equal(null);
      expect(gameState.baseRunners[3]).to.equal(null);
      expect(gameState.baseRunners[1]).to.equal('bob');
    });
    it('Handles third base runner scoring on a 43 double play', () => {
      gameState.baseRunners[1] = 'jim';
      gameState.baseRunners[3] = 'john';
      const result = play.advanceRunners(gameState, ['1'], 0, '3-H');
      expect(gameState.outs).to.equal(2);
      expect(gameState.baseRunners[2]).to.equal(null);
      expect(gameState.baseRunners[3]).to.equal(null);
      expect(gameState.baseRunners[1]).to.equal(null);
      expect(gameState.score[0]).to.equal(1);
    });
    it('Handles a standard groundball out with no runners on', () => {
      const result = play.advanceRunners(gameState, [], 0, '');
      expect(gameState.outs).to.equal(1);
      expect(gameState.baseRunners[2]).to.equal(null);
      expect(gameState.baseRunners[3]).to.equal(null);
      expect(gameState.baseRunners[1]).to.equal(null);
      expect(gameState.score[0]).to.equal(0);
    });
    it('Handles a single where the batter advances to second on an error', () => {
      const result = play.advanceRunners(gameState, [], 1, 'B-2');
      expect(gameState.outs).to.equal(0);
      expect(gameState.baseRunners[2]).to.equal('bob');
      expect(gameState.baseRunners[3]).to.equal(null);
      expect(gameState.baseRunners[1]).to.equal(null);
      expect(gameState.score[0]).to.equal(0);
    });
    it('Handles a homerun', () => {
      const result = play.advanceRunners(gameState, [], 4, '');
      expect(gameState.outs).to.equal(0);
      expect(gameState.baseRunners[2]).to.equal(null);
      expect(gameState.baseRunners[3]).to.equal(null);
      expect(gameState.baseRunners[1]).to.equal(null);
      expect(gameState.score[0]).to.equal(1);
    });
    it('Handles a groundball out where the batter is explicitly given as an out', () => {
      const result = play.advanceRunners(gameState, ['B'], 0, '');
      expect(gameState.outs).to.equal(1);
      expect(gameState.baseRunners[2]).to.equal(null);
      expect(gameState.baseRunners[3]).to.equal(null);
      expect(gameState.baseRunners[1]).to.equal(null);
      expect(gameState.score[0]).to.equal(0);
    });
    it('Handles a single where the runner on third scores on a throwing error and the batter advances to second', () => {
      gameState.baseRunners[3] = 'john';
      const result = play.advanceRunners(gameState, [], 1, 'B-2;3-H(UR)');
      expect(gameState.outs).to.equal(0);
      expect(gameState.baseRunners[2]).to.equal('bob');
      expect(gameState.baseRunners[3]).to.equal(null);
      expect(gameState.baseRunners[1]).to.equal(null);
      expect(gameState.score[0]).to.equal(1);
    });
    it('Handles a single where the runner on first is out trying to go to third', () => {
      gameState.baseRunners[1] = 'jim';
      const result = play.advanceRunners(gameState, [], 1, '1X3');
      expect(gameState.outs).to.equal(1);
      expect(gameState.baseRunners[1]).to.equal('bob');
      expect(gameState.baseRunners[3]).to.equal(null);
      expect(gameState.baseRunners[2]).to.equal(null);
      expect(gameState.score[0]).to.equal(0);
    });
    it('Handles a ground ball out where the runner on third does not advance', () => {
      gameState.baseRunners[3] = 'john';
      const result = play.advanceRunners(gameState, [], 0, '3-3');
      expect(gameState.outs).to.equal(1);
      expect(gameState.baseRunners[1]).to.equal(null);
      expect(gameState.baseRunners[3]).to.equal('john');
      expect(gameState.baseRunners[2]).to.equal(null);
      expect(gameState.score[0]).to.equal(0);
    });
  });
})
