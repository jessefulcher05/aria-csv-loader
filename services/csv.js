const csv = require('csvtojson');
var json2csv = require('json2csv');
const _ = require('underscore');

// Take in CSV and return JSON
module.exports.csvToJson = function(csvFilePath, checkType, trim, ignoreEmpty) {
  return new Promise(function(resolve, reject){
    try {
      checkType = checkType || false;
      trim = trim || true;
      ignoreEmpty = ignoreEmpty || true;
      // Take in CSV file and convert to JSON
      let output = [];
      console.info(`Beginning to read file...`);
      csv({
        checkType: checkType,
        trim: trim,
        ignoreEmpty: ignoreEmpty
      }).fromFile(csvFilePath)
      .on('json', row => {
        output.push(row);
      })
      .on('done', err => {
        if(err) return reject(err);
        console.info(`Finished reading file. Read ${output.length} lines.`);
        resolve(output);
      });
    } catch(e) {
      console.error('exception thrown reading csv', e);
      reject({message: "Error reading csv file", error: e});
    }
  });
};

module.exports.objToCsv = function(obj, transHeader, includeHeader) {
  return new Promise(function(resolve, reject) {
    includeHeader = _.isUndefined(includeHeader) ? true : includeHeader;
    var options = {
      data: obj,
      flatten: true,
      hasCSVColumnTitle: includeHeader ? true : false, // ensure boolean value
    };

    json2csv(options, function(err, csv) {
      if (err) {
        reject({message: "Error converting json to csv", error: err});
      } else {
        if (transHeader) {
          csv = transformCsvHeader(csv);
        }
        resolve(csv);
      }
    });
  });
};

/**
 * Helper function
 * Replace csv header with provided strings
 */
function transformCsvHeader(str, replStr, matchRegEx) {
  matchRegEx = matchRegEx || new RegExp(/\.0\./g);
  replStr = '[0].';
  var headerEndIdx = str.search('\n');
  var header = str.substring(0,headerEndIdx);
  var newStr = header.replace(matchRegEx, replStr);
  newStr += str.substring(headerEndIdx);
  return newStr;
}