'use strict';

const updatedConnection = require('./updated-connection');
const removedConnection = require('./removed-connection');

const globalHooks = require('../../../hooks');
const hooks = require('feathers-hooks');
const auth = require('feathers-authentication').hooks;

exports.before = {
  all: [],
  find: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()],
  get: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()],
  create: [],
  update: [],
  patch: [],
  remove: [
    auth.verifyToken(),
    auth.populateUser(),
    auth.restrictToAuthenticated()]
};

exports.after = {
  all: [],
  find: [],
  get: [],
  create: [updatedConnection()],
  update: [updatedConnection()],
  patch: [updatedConnection()],
  remove: [removedConnection()]
};
