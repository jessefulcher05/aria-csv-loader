var Aria = require('aria-sdk-unofficial');

module.exports = function(env, clientNo, authKey) {
  return new Aria({ env, clientNo, authKey });
};