'use strict';
const token = require('./token');
const temp = require('./temp');
const channels = require('./channels');
const authentication = require('./authentication');
const user = require('./user');
const connection = require('./connection');

module.exports = function() {
  const app = this;


  app.configure(authentication);
  app.configure(user);
  app.configure(channels);
  app.configure(temp);
  app.configure(token);
  app.configure(connection);
};
