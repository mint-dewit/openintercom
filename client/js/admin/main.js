var io = require('socket.io-client');
var SIP = require('sip.js');

var authenticated = false;
var sessions = {};

const socket = io();

const app = feathers()
  .configure(feathers.socketio(socket))
  .configure(feathers.hooks())
  .configure(feathers.authentication({
    storage: window.localStorage
  }));

const users = app.service('users');
const channels = app.service('channels');
const temps = app.service('temps');