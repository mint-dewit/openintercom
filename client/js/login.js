// npm modules
var $ = window.jQuery = window.$ = require('jquery');
require('materialize-css');
require('materialize-loader');
var Vue = require('vue');
var feathers = require('feathers/client');
feathers.socketio = require('feathers-socketio/client');
feathers.hooks = require('feathers-hooks');
feathers.authentication = require('feathers-authentication/client');
var io = require('socket.io-client');

const socket = io();

const app = feathers()
  .configure(feathers.socketio(socket))
  .configure(feathers.hooks())
  .configure(feathers.authentication({
    storage: window.localStorage
  }));

new Vue({
  el: '#login',
  data: {
    username: '',
    password: ''
  },
  methods: {
    login: function () {
      app
      .authenticate({type: 'local', 'name':this.username, 'password': this.password})
      .then(function () { window.location.href = "/admin.html"; });
    }
  }
}) 


