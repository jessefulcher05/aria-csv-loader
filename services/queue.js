const queue = require('async/queue');

/*
// Task should be in this format
  var task = {
    apiType: 'core',
    apiName: 'record_usage_m',
    counter: 1, // number in queue when added (optional)
    payload: {},
    response: {} // added after output
  };
*/

/**
 * Initialize queue with aria connection object and the number of threads
 * @param {aria} Aria [Aria connection object]
 * @param {threads} number [number of concurrent tasks. defaults to 30 if not provided]
 * @param {printOutputCount} number Optional [is used to determine how often to print to the console about a status update when finished]
 */
module.exports = function(aria, threads, printOutputCount) {
  threads = threads || 30;
  printOutputCount = printOutputCount || 100;
  return queue(function(task, callback) {
    aria.call(task.apiType, task.apiName, task.payload)
    .then(results => {
      if(task.counter && task.counter % printOutputCount === 0) {
        console.log(`Finshed processing records in group ${task.counter-printOutputCount} through ${task.counter}`);
      }
      task.response = results;
      callback(null, results);
    })
    .catch(err => {
      callback(err);
    });
  }, threads);
};

