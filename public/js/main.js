$('.modal').modal()

var key_order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
var ptt_ignore = [];
var ptt_pushed = [];
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

var ua;
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

$('input[type=text]').on('click', ()=>{admin.sub_interface = true});
$('input[type=text]').on('focusout', ()=>{admin.sub_interface = false});