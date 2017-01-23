require('dotenv').config(); // global params
const _ = require('underscore');
const moment = require('moment');
const path = require('path');
var fs = require('fs');
const EventEmitter = require('events');

const csv = require('./services/csv');
const Aria = require('./services/aria');
const Queue = require('./services/queue');

const ApiTask = require('./models/api-task').ApiTask;

class ApiTaskEventEmitter extends EventEmitter {}
// const apiTaskEventEmitter = new ApiTaskEventEmitter();
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

if(!['core', 'object', 'admintools'].includes(data.apiType)) {
  console.error(`API_TYPE of ${data.apiType} is invalid. valid values are 'core', 'object','admintools'`);
  process.exit(1);
}

let confirmText = `Loading the following data:\n`;
confirmText += `Client: ${data.clientNo}\n`;
confirmText += `Auth Key: ${data.authKey}\n`;
confirmText += `Environment: ${data.env}\n`;
confirmText += `Api Type: ${data.apiType}\n`;
confirmText += `Api: ${data.clientNo}\n`;
confirmText += `Threads: ${data.threads}\n`;
confirmText += `Input File: ${data.filename}\n`;

console.info(confirmText);

/**
 * 
 */
let tasks = [];
let startTime;
let finishTime;
let apiTaskEventEmitter = new ApiTaskEventEmitter();
let isFirst = true;
let allResultsPromises = [];


/**
 * Initialize Aria object
 */
let aria = Aria(data.env, data.clientNo, data.authKey);

/**
 * Initialize queue and output filestream
 */
let queue = Queue(aria, data.threads, data.printOutputCount);

let writeStream = fs.createWriteStream(data.outputPath, {});

/**
 * Initialize Event Handlers
 */

/**
 * Each task emits the respond event after being processed
 */
apiTaskEventEmitter.on('response', (apiTask) => {
  let includeHeader = isFirst;
  let result = csv.objToCsv(apiTask.response, null, includeHeader);
  allResultsPromises.push(result);
  result.then(csvString => {
    writeStream.write(`${csvString}\n`);
  })
  .catch(err => {
    console.error("error writing row ot stream", err);
  });
  isFirst = false;
});

/**
 * If there was a fatal error processing a task, write error information
 */
apiTaskEventEmitter.on('error', (err, apiTask) => {
  err = err || {};
  let writeString = '';
  writeString += `${apiTask.csvRowNum},`;
  writeString += `${apiTask.startTime},`;
  writeString += `${apiTask.finishTime},`;
  writeString += `${apiTask.response._duration},`;
  writeString += `FATAL ERROR: ${err.name} ${err.message}`;
  writeStream.write(`${writeString}\n`);
});

/**
 * Once the .drain method is called from the tasks,
 * the finish event is called. Once all response promises are resolved,
 * then the file stream is closed
 */
apiTaskEventEmitter.on('finish', () => {
  console.log('closing file');
  Promise.all(allResultsPromises)
  .then(() => {
    writeStream.close();
    console.info("Successfully closed file");
    process.exit(0);
  })
  .catch(err => {
    console.error("Error waiting for all writing to finish");
    process.exit(1);
  });
});


/**
 * Callback function called after all items in queue are processed
 */
queue.drain = function() {
  console.info('all items have been processed');
  finishTime = moment();
  console.info('Finish Time', finishTime.format('hh:mm:ss'));
  const duration = finishTime - startTime;
  if(duration > 60000) {
    console.info('TotalTime', `${moment.duration(duration).asMinutes()} minutes` );
  } else {
    console.info('TotalTime', `${moment.duration(duration).asSeconds()} seconds` );
  }
  apiTaskEventEmitter.emit('finish');
};



/**
 * Parse CSV and build task from each row to send to queue for processing
 */
csv.csvToJson(data.filepath)
.then(csvObj => {
  console.info('Starting data load.... please wait');
  startTime = moment();
  console.info('Start Time', startTime.format('hh:mm:ss'));
  let counter = 0;
  for(let i = 0; i < data.iterations; i++) {
    let csvRowNum = 1; // resets for each iterations
    csvObj.forEach(row => {
      tasks.push(new ApiTask({
        apiType: data.apiType,
        apiName: data.apiName,
        csvRowNum: csvRowNum++,
        counter: counter++,
        iteration: i,
        payload: row,
        response: {}
      }, apiTaskEventEmitter));
    });

  }
  queue.push(tasks, (err) => {
 });
})
.catch(err => {
  console.error('Fatal error reading file, exiting', err.message);
  process.exit(1);
});