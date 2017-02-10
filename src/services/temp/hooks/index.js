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
  update: [
    auth.verifyToken(),
    auth.restrictToAuthenticated()],
  patch: [
    auth.verifyToken(),
    auth.restrictToAuthenticated()],
  remove: [
    auth.verifyToken(),
    auth.restrictToAuthenticated()]
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
