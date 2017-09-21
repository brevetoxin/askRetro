'use strict';

const fileManager = require('../components/fileManager');
const config = require('../config/default.json');
const chai = require('chai');
const expect = chai.expect;

describe.only('File Manager', () => {
  describe('filterByLeague', () => {
    it('Returns true when the league is not set', () => {
      expect(fileManager.filterByLeague('/2017eve/2017STL.EVN', undefined)).to.equal(true);
    });
    it('Returns true when league is A and file is for American league team', () => {
      expect(fileManager.filterByLeague('/2017eve/2017ARI.EVA', 'A')).to.equal(true);
    });
    it('Returns true when league is N and file is for National league team', () => {
      expect(fileManager.filterByLeague('/2017eve/2017STL.EVN', 'N')).to.equal(true);
    });
    it('Returns false when league is N and file is for American league team', () => {
      expect(fileManager.filterByLeague('/2017eve/2017ARI.EVA', 'N')).to.equal(false);
    });
    it('Returns false when league is A and file is for National league team', () => {
      expect(fileManager.filterByLeague('/2017eve/2017STL.EVN', 'A')).to.equal(false);
    });
    it('Returns false when league code is not valid', () => {
      expect(fileManager.filterByLeague('/2017eve/2017STL.EVN', 'Y')).to.equal(false);
    });
  })
})
