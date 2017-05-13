'use strict';

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

const createChannel = require('./create-channel')
const removeChannel = require('./remove-channel');

exports.before = {
  all: [],
  find: [],
  get: [],
  create: [],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [createChannel()],
  update: [],
  patch: [],
  remove: [removeChannel()]
};
