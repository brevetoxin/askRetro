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
  })
})
