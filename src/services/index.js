'use strict';
const temp = require('./temp');
const channels = require('./channels');
const authentication = require('./authentication');
const user = require('./user');

module.exports = function() {
  const app = this;


  app.configure(authentication);
  app.configure(user);
  app.configure(channels);
  app.configure(temp);
};
