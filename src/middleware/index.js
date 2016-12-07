'use strict';

const setup = require('./setup');

const handler = require('feathers-errors/handler');
const notFound = require('./not-found-handler');
const logger = require('./logger');;
const useragent = require('express-useragent');

module.exports = function() {
  // Add your custom middleware here. Remember, that
  // just like Express the order matters, so error
  // handling middleware should go last.
  const app = this;
  app.use(useragent.express());

  app.use('/setup', setup(app))

  app.use(notFound());
  app.use(logger(app));
  app.use(handler());
};
