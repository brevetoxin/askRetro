'use strict';

const sinon = require('sinon');

const fileManager = require('../components/fileManager');
const config = require('../components/configuration');
const chai = require('chai');
const expect = chai.expect;

describe.only('File Manager', () => {
  let configStub;
  beforeEach(() => {
    configStub = sinon.stub(config, 'get');
  });
  afterEach(() => {
    configStub.restore();
  });
  describe('filterByLeague', () => {
    it('Returns true when the league is not set', () => {
      expect(fileManager.filterByLeague('/2017eve/2017STL.EVN')).to.equal(true);
    });
    it('Returns true when league is A and file is for American league team', () => {
      configStub.returns('A');
      expect(fileManager.filterByLeague('/2017eve/2017ARI.EVA')).to.equal(true);
    });
    it('Returns true when league is N and file is for National league team', () => {
      configStub.returns('N');
      expect(fileManager.filterByLeague('/2017eve/2017STL.EVN')).to.equal(true);
    });
    it('Returns false when league is N and file is for American league team', () => {
      configStub.returns('N');
      expect(fileManager.filterByLeague('/2017eve/2017ARI.EVA')).to.equal(false);
    });
    it('Returns false when league is A and file is for National league team', () => {
      configStub.returns('A');
      expect(fileManager.filterByLeague('/2017eve/2017STL.EVN')).to.equal(false);
    });
    it('Returns false when league code is not valid', () => {
      configStub.returns('Y');
      expect(fileManager.filterByLeague('/2017eve/2017STL.EVN')).to.equal(false);
    });
  });
  describe('Filter by Team', () => {
    it ('Returns true when there is no team configured', () => {
      expect(fileManager.filterByTeam('/2017eve/2017STL.EVN')).to.equal(true);
    });
    it ('Returns true when the team file matches the configured team', () => {
      configStub.returns('STL');
      expect(fileManager.filterByTeam('/2017eve/2017STL.EVN')).to.equal(true);
    });
    it ('Returns false when the team file does not match the configured team', () => {
      configStub.returns('ARI');
      expect(fileManager.filterByTeam('/2017eve/2017STL.EVN')).to.equal(false);
    });
  });
  describe('Filter by Year', () => {
    it('Returns true when there is no start year or end year', () => {
      expect(fileManager.filterByYear('/2017eve/2017STL.EVN')).to.equal(true);
    });
    it('Returns true when start year is actual year and file is after start', () => {
      configStub.onFirstCall().returns(2015);
      configStub.onSecondCall().returns();
      expect(fileManager.filterByYear('/2017eve/2017STL.EVN')).to.equal(true);
    });
    it('Returns true when start year is years in past and file is after start', () => {
      configStub.onFirstCall().returns(-3);
      configStub.onSecondCall().returns();
      expect(fileManager.filterByYear('/2017eve/2017STL.EVN')).to.equal(true);
    });
    it('Returns false when start year is actual year and file is before start', () => {
      configStub.onFirstCall().returns(2015);
      configStub.onSecondCall().returns();
      expect(fileManager.filterByYear('/2017eve/2014STL.EVN')).to.equal(false);
    });
    it('Returns false when start year is years in past and file is before start', () => {
      configStub.onFirstCall().returns(-3);
      configStub.onSecondCall().returns();
      expect(fileManager.filterByYear('/2017eve/2013STL.EVN')).to.equal(false);
    });
    it('Returns true when end year is actual year and file is before end', () => {
      configStub.onFirstCall().returns();
      configStub.onSecondCall().returns(2015);
      expect(fileManager.filterByYear('/2017eve/2014STL.EVN')).to.equal(true);
    });
    it('Returns true when end year is years in the past and file is before end', () => {
      configStub.onFirstCall().returns();
      configStub.onSecondCall().returns(-2);
      expect(fileManager.filterByYear('/2017eve/2014STL.EVN')).to.equal(true);
    });
    it('Returns false when end year is actual year and file is after end', () => {
      configStub.onFirstCall().returns();
      configStub.onSecondCall().returns(2015);
      expect(fileManager.filterByYear('/2017eve/2017STL.EVN')).to.equal(false);
    });
    it('Returns false when end year is years in the past and file is after end', () => {
      configStub.onFirstCall().returns();
      configStub.onSecondCall().returns(-2);
      expect(fileManager.filterByYear('/2017eve/2017STL.EVN')).to.equal(false);
    });
  });
  describe('File Filter', () => {
    it('Returns true if there are no filters', () => {
      expect(fileManager.fileFilter('/2017eve/2017STL.EVN')).to.equal(true);
    });
    it('Returns false if the file fails the league test', () => {
      configStub.returns('A');
      expect(fileManager.fileFilter('/2017eve/2017STL.EVN')).to.equal(false);
    });
    it('Returns false if the file fails the team test', () => {
      configStub.onSecondCall().returns('ARI');
      expect(fileManager.fileFilter('/2017eve/2017STL.EVN')).to.equal(false);
    });
    it('Returns false if the file fails the year test', () => {
      configStub.onCall(3).returns(2016);
      expect(fileManager.fileFilter('/2017eve/2017STL.EVN')).to.equal(false);
    });
  });
  describe('Retrieve Files', () => {
    it ('Resolves with the files', () => {
      configStub.onFirstCall().returns('./test/testFiles/');
      return fileManager.retrieveFiles()
        .then(files => {
          expect(files.length).to.equal(2);
          expect(files).to.include('test/testFiles/a.json');
          expect(files).to.include('test/testFiles/b.json');
        });
    });
  });
  describe('Get Contents', () => {
    it ('Resolves with the contents of the file when the file exists', () => {
      return fileManager.getContents('./test/testFiles/b.json')
        .then(contents => {
          const result = JSON.parse(contents);
          expect(result.test).to.equal('Test');
        });
    });
    it('Rejects with error when file does not exist', () => {
      return fileManager.getContents('./test/testFiles/doesNoytExist.json')
        .then(contents => {
          expect.fail(contents);
        })
        .catch(err => {
          expect(err.code).to.equal('ENOENT');
        })
    })
  });
});
