'use strict';

const freeswitch = require('./freeswitch');

const register = require('./register');

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;


exports.before = {
  all: [],
  find: [
    auth.verifyToken(),
    auth.restrictToAuthenticated()],
  get: [],
  create: [
    register()],
  update: [],
  patch: [],
  remove: []
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [globalHooks.fsAddUser()],
  update: [],
  patch: [],
  remove: []
};
