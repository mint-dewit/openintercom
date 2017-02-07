'use strict'

// npm modules
window.jQuery = window.$ = require('jquery');
var materialize = require('/media/chrx/Archive/GalliumDocs/openintercom/node_modules/materialize-css/bin/materialize.js');
require('materialize-loader');
var Vue = require('vue');

$('.modal').modal({dismissible: false});

var key_order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
var ptt_ignore = [];
var ptt_pushed = [];
var sessions = [];
var admin;

const socket = io();

const app = feathers()
  .configure(feathers.socketio(socket))
  .configure(feathers.hooks())
  .configure(feathers.authentication({
    storage: window.localStorage
  }));

const channels = app.service('channels');
const temps = app.service('temps');
var user_id = window.localStorage._id;

var ua;
var sessions;
var config;
var options = {
  media: {
    constraints: {
      audio: true,
      video: false
    },
    render: {
      remote: document.getElementById('remoteAudio')
    }
  }
};

$(document).on('keydown', (event) => {controls.pushToTalk(event.key, 'down')});
$(document).on('keyup', (event) => {controls.pushToTalk(event.key, 'up')});