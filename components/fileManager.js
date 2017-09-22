'use strict'

const readDir = require('recursive-readdir');
const fs = require('fs');
const config = require('./configuration');

let targetFiles = [];

const fileFilter = (filePath => {
  if (!filterByLeague(filePath)) return false;
  if (!filterByTeam(filePath)) return false;
  if (!filterByYear(filePath)) return false;
  return true;
});

const filterByLeague = ((filePath) => {
  const league = config.get('league');
  if (league) {
    const fileParts = filePath.split('.');
    const extension = fileParts.pop();
    if (league === 'A') return extension === 'EVA';
    if (league === 'N') return extension === 'EVN';
    return false;
  }
  return true;
});

const filterByTeam = (filePath => {
  const team = config.get('team');
  if (team) {
    const pathParts = filePath.split('/');
    const fileParts = pathParts.pop().split('.');
    const fileName = fileParts[0];
    return fileName.substring(4, 7) === team;
  }
  return true;
});

const filterByYear = (filePath => {
  const startYear = config.get('startYear');
  const endYear = config.get('endYear');
  if (startYear || endYear) {
    const start = startYear < 1 ? new Date().getFullYear() + startYear : startYear;
    const end = endYear < 1 ? new Date().getFullYear() + endYear : endYear;
    const pathParts = filePath.split('/');
    const fileParts = pathParts.pop().split('.');
    const fileName = fileParts[0];
    const fileYear = fileName.substring(0,4);
    if (start && Number(fileYear) < start) return false;
    if (end && Number(fileYear) > end) return false;
    return true;
  }
  return true;
});

const retrieveFiles = () => {
  return readDir(config.get('resourcePath'))
    .then(files => files.filter(file => fileFilter(file)));
};

const getContents = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf-8', (err, data) => {
      if (err) reject(err);
      resolve(data);
    });
  });
};

module.exports = {
  retrieveFiles,
  filterByLeague,
  filterByTeam,
  filterByYear,
  fileFilter,
  getContents
};
