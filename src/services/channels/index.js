'use strict';

const path = require('path');
const NeDB = require('nedb');
const service = require('feathers-nedb');
const hooks = require('./hooks');

module.exports = function(){
  const app = this;

  const db = new NeDB({
    filename: path.join(app.get('nedb'), 'channels.db'),
    autoload: true
  });

  let options = {
    Model: db
  };

  // Initialize our service with any options it requires
  app.use('/channels', service(options));

  // Get our initialize service to that we can bind hooks
  const channelsService = app.service('/channels');

  // Set up our before hooks
  channelsService.before(hooks.before);

  // Set up our after hooks
  channelsService.after(hooks.after);

  // Create mediaRooms
  app.service('channels').find().then((results) => {
    for (let channel of results) {
      app.mediaHooks.createRoom(channel._id);
    }
  })
};
