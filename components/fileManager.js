'use strict'

var recursive = require("recursive-readdir");
const config = require('../config/default.json');

const startYear = process.env['ASKRETRO_START_YEAR'] || config.startYear;
const endYear = process.env['ASKRETRO_END_YEAR'] || config.endYear;
const league = process.env['ASKRETRO_LEAGUE'] || config.league;
const team = process.env['ASKRETRO_TEAM'] || config.team;
const resourceFolder = process.env['ASKRETRO_RESOURCE_FOLDER'] || config.resourcePath;
let targetFiles = [];

const fileFilter = (filePath => {
  if (!filterByLeague(filePath)) return false;
  if (!filterByTeam(filePath)) return false;
  if (!filterByYear(filePath)) return false;
  return true;
});

const filterByLeague = (filePath => {
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
  if (team) {
    const pathParts = filePath.split('/');
    const fileParts = pathParts.pop().split('.');
    const fileName = fileParts[0];
    return fileName.substring(4, 7) === team;
  }
  return true;
});

const filterByYear = (filePath => {
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
  return new Promise ((resolve, reject) => {
    recursive(resourceFolder, function(err, items) {
        if (err) reject(err);
        targetFiles = items.filter(item => fileFilter(item));
        resolve(targetFiles);
    });
  })

}

module.exports = {
  retrieveFiles,
  targetFiles
};
