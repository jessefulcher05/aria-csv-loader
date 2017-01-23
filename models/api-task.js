const _ = require('underscore');
const moment = require('moment');
/**
 * 
 * Api Task holds data to be processed by queue
 * 
 */

function ApiTask(data, apiTaskEventEmitter) {
  this._ON_RESPONSE = 'response';
  this._ON_ERROR = 'error';
  data = data || {};
  this.apiType = data.apiType || null;
  this.apiName = data.apiName || null;
  this.counter = data.counter;
  this.csvRowNum = data.csvRowNum || 1;
  this.iteration = data.iteration || 0;
  this.payload = data.payload || {};
  this.response = {
    _InputCsvRowNum: this.csvRowNum,
    _startTime: null,
    _finishTime: null,
    _duration: null
  };
  this.startTime = null;
  this.finishTime = null;
  this.duration = null;
  this.durationString = null;
  this.err = null;
  this.apiTaskEventEmitter = apiTaskEventEmitter;
}

ApiTask.prototype.start = function() {
  this.startTime = moment();
};

ApiTask.prototype.addResponse = function(response) {
  _.extend(this.response, response);
  this._setTimes();
  // emit event
  if(this.apiTaskEventEmitter) {
    this.apiTaskEventEmitter.emit(this._ON_RESPONSE, this);
  }
};

ApiTask.prototype._setTimes = function() {
  this.finishTime = moment();
  this.duration = this.finishTime - this.startTime;
  this.response._startTime = this.startTime.format('hh:mm:ss');
  this.response._finishTime = this.finishTime.format('hh:mm:ss');
  this.response._duration = `${moment.duration(this.duration).asMilliseconds()} ms`;
};

ApiTask.prototype.addError = function(err) {
  this._setTimes();
  console.error(err);
  this.err = err;
  // emit event
  if(this.apiTaskEventEmitter) {
    this.apiTaskEventEmitter.emit(this._ON_ERROR, new Error(this.err), this);
  }
};

module.exports.ApiTask = ApiTask;