require('dotenv').config(); // global params
const _ = require('underscore');
const moment = require('moment');
const path = require('path');
var fs = require('fs');

const csv = require('./services/csv');
const Aria = require('./services/aria');
const Queue = require('./services/queue');



// Read environment variables
let data = {
  filename: process.env.CSV_FILENAME,
  filepath: path.join(__dirname, 'files', 'input', process.env.CSV_FILENAME),
  outputPath: path.join(__dirname, 'files', 'output', `${moment().format('YYYY-MM-DD_HH.mm.ss')}_${process.env.CSV_FILENAME}`),
  iterations: process.env.ITERATIONS || 1,
  apiName: process.env.API_NAME,
  apiType: process.env.API_TYPE,
  env: process.env.ENV,
  clientNo: process.env.CLIENT_NO,
  authKey: process.env.AUTH_KEY,
  threads: process.env.THREADS || 30,
  printOutputCount: process.env.PRINT_OUTPUT_COUNT || 100,
};

///// Validate input //////
// Exit if any environment variables are not included
if (_.isUndefined(data.filename) ||
    _.isUndefined(data.apiName) ||
    _.isUndefined(data.apiType) ||
    _.isUndefined(data.env) ||
    _.isUndefined(data.clientNo) ||
    _.isUndefined(data.authKey)) {
      console.error('All required variables were not included in .env - Please review README.md for a list of required variables');
      process.exit(1);
}

if(!['core', 'object','admintools'].includes(data.apiType)) {
  console.error(`API_TYPE of ${data.apiType} is invalid. valid values are 'core', 'object','admintools'`);
  process.exit(1);
}

let confirmText = `We are loading the following data:\n`;
confirmText += `Clinet: ${data.clientNo}\n`;
confirmText += `Auth Key: ${data.authKey}\n`;
confirmText += `Environment: ${data.env}\n`;
confirmText += `Api Type: ${data.apiType}\n`;
confirmText += `Api: ${data.clientNo}\n`;
confirmText += `Threads: ${data.threads}\n`;
confirmText += `Input File: ${data.filename}\n`;

console.log(confirmText);

/**
 * Initialze tasks variable to hold all tasks processed by queue.
 * Response is also added to task object
 */
let tasks = [];
let headers = [];
let startTime;
let finishTime;
/**
 * Initialize Aria object
 */
let aria = Aria(data.env, data.clientNo, data.authKey);
console.log('Aria connection initialized', aria);

/**
 * Initialize queue
 */
let queue = Queue(aria, data.threads, data.printOutputCount);

/**
 * Callback function called after all items in queue are processed
 */
queue.drain = function() {
  console.log('all items have been processed');
  finishTime = moment();
  console.log('Finish Time', finishTime.format('hh:mm:ss'));
  const duration = finishTime - startTime;
  if(duration > 60000) {
    console.log('TotalTime', `${moment.duration(duration).asMinutes()} minutes` );
  } else {
    console.log('TotalTime', `${moment.duration(duration).asSeconds()} seconds` );
  }
  console.log('Saving output file');
  const responses = tasks.map(task => task.response);
  responses.forEach(response => {
    headers = _.union(Object.keys(response));
  });
  csv.objToCsv(responses)
  .then(csvOutput => {
    fs.writeFile(data.outputPath, csvOutput, function(err) {
      if (err) {
        console.error('Error saving file', err);
        process.exit(1);
      }
      console.log('file saved to', data.outputPath);
      process.exit(0);
    });
  })
  .catch(err => {
    console.error('Error creating CSV object for output', err);
    process.exit(1);
  });
  


};

/**
 * Parse CSV and build task from each row to send to queue for processing
 */
csv.csvToJson(data.filepath)
.then(csvObj => {
  console.log('Starting data load.... pelase wait');
  startTime = moment();
  console.log('Start Time', startTime.format('hh:mm:ss'));
  let counter = 0;
  for(let i = 0; i < data.iterations; i++) {

    csvObj.forEach(row => {
      tasks.push({
        apiType: data.apiType,
        apiName: data.apiName,
        counter: counter++,
        payload: row,
        response: {}
      });
    });

  }
  queue.push(tasks, (err) => {
  });
})
.catch(err => {
  console.log('Fatal error reading file, exiting', err.message);
  process.exit(1);
});