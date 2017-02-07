// npm modules

require('script-loader!materialize-css');
require('materialize-loader');

var feathers = require('script-loader!feathers/client');
feathers.socketio = require('script-loader!feathers-socketio/client');
feathers.hooks = require('script-loader!feathers-hooks');
feathers.authentication = require('script-loader!feathers-authentication/client');

$('.modal').modal()


var io = require('script-loader!socket.io-client');
var SIP = require('script-loader!sip.js');

require('script-loader!./admin/main.js')
require('script-loader!./sessions.js');
require('script-loader!./admin/feathers.js');
require('script-loader!./admin/vue.js');
require('script-loader!./vue-controls.js');



// var io = require('socket.io-client');
// var SIP = require('sip.js');

// var authenticated = false;
// var sessions = {};

// const socket = io();

// const app = feathers()
//   .configure(feathers.socketio(socket))
//   .configure(feathers.hooks())
//   .configure(feathers.authentication({
//     storage: window.localStorage
//   }));

// const users = app.service('users');
// const channels = app.service('channels');
// const temps = app.service('temps');

// var ua;
// var options = require('./ua-options.js');

// $(document).on('keydown', (event) => {controls.pushToTalk(event.key, 'down')});
// $(document).on('keyup', (event) => {controls.pushToTalk(event.key, 'up')});

// $('input[type=text]').on('click', ()=>{admin.sub_interface = true});
// $('input[type=text]').on('focusout', ()=>{admin.sub_interface = false});

// app.authenticate()
//     .then(res => {
//       admin.self = res.data;
//       controls.self = res.data;
//       authenticated = true;

//       config = {
//         uri: res.data._id+'@'+window.location.host,
//         wsServers: 'wss://'+window.location.host+':7443',
//         authorizationUser: res.data._id,
//         password: '4321',
//         iceCheckingTimeout: 180000,
//         log: {builtinEnabled: false}
//       }
//       ua = new SIP.UA(config);

//       users.find()
//         .then(res => {
//           for (user of res) {
//             admin.users.push(user);
//           }
//         })

//       temps.find()
//         .then(res => {
//           for (user of res) {
//             if (user.newuser === false) {
//               admin.temps.push(user);
//             } else {
//               admin.new_users.push(user);
//             }
//           }
//         })

//       channels.find()
//         .then(res => {
//           console.log(res);
//           admin.channels = res;
//           for (channel of res) {
//             for (user in channel.users) {
//               if (user === controls.self._id) {
//                 sessions[channel._id] = new session(ua, channel.room, config) /*ua.invite(channel.room.toString(), options);
//                 sessions[channel._id].mute();*/
//                 controls.channels.push({
//                   _id: channel._id,
//                   name: channel.name,
//                   talking: false,
//                   muted: !(channel.users[user])
//                 })
//               }
//             }
//           }
//         })
//     })
//     .catch(error => {
//       if (error.code === 401) window.location.href = '/login.html'
//     });

//   channels.on('created', res => admin.channels.push(res));
//   channels.on('removed', res => {
//     for (channel in admin.channels) {
//       if (admin.channels[channel]._id === res._id) {
//         admin.channels.splice(channel, 1);
//       }
//     }
//     for (channel in controls.channels) {
//       if (controls.channels[channel]._id === res._id) {
//         controls.channels.splice(channel, 1)
//       }
//     }
//   });
//   channels.on('updated', res => {
//     for (chan in admin.channels) {
//       if (admin.channels[chan]._id === res._id) {
//         Vue.set(admin.channels, chan, res);
//       }
//     }
//     /*
//       1 we already have channel
//         1 we are still in channel => update talky
//         2 we are no longer in channel => remove channel
//       2 we do not have channel
//         1 we are in channel => add channel
//     */
    
//     var hasChannel;
//     var resHasId = res.users[controls.self._id] !== undefined;
//     for (var channel of controls.channels) {
//       if (channel._id === res._id) {
//         hasChannel = channel;
//       }
//     }

//     if (hasChannel) {
//       if (resHasId) {
//         hasChannel.muted = !(res.users[controls.self._id])
//         if (hasChannel.muted && hasChannel.talking) hasChannel.talking = false;
//         if (hasChannel.muted) sessions[res._id].mute();
//       }
//       else {
//         for (i in controls.channels) {
//           if (controls.channels[i]._id === res._id) {
//             controls.channels.splice(i, 1);
//             sessions[res._id].bye();
//           }
//         }
//       }
//     } else {
//       if (resHasId) {
//         sessions[res._id] = new session(ua, res.room, options); // ua.invite(res.room.toString(), options);
//         controls.channels.push({
//           _id: res._id,
//           name: res.name,
//           talking: false,
//           muted: !(res.users[controls.self._id])
//         })
//       }
//     }
//   })

//   users.on('updated', res => {
//     for (let user of admin.users) {
//       if (user._id === res.id) user = res;
//     }
//   })
//   users.on('removed', res => {
//     for (var u in admin.users) {
//       if (admin.users[u]._id === res._id) {
//         admin.users.splice(u,1);
//       }
//     }
//   })

//   temps.on('updated', res => {
//     for (var user in admin.new_users) {
//       if (admin.new_users[user]._id === res._id) {
//         console.log('user '+res._id+' was updated');
//         if (res.newuser === false) {
//           admin.temps.push(res);
//           admin.new_users.splice(user, 1);
//         }
//       }
//     }
//   })
//   temps.on('created', res => {
//     console.log(res);
//     admin.new_users.push(res);
//   })
//   temps.on('removed', res => {
//     for (var u in admin.temps) {
//       if (admin.temps[u]._id === res._id) {
//         admin.temps.splice(u,1);
//       }
//     }
//   })

// // custom js
// var session = require('./sessions.js');
// var admin = new Vue({
//   debug: true,
//   el: '#admin',
//   data: {
//     sel_channel: 0,
//     new_channel: '',
//     sub_interface: false,
//     channels: [],
//     self: {
//       _id: '',
//       name: '',
//       client: '',
//       ip: '',
//       admin: true
//     },
//     users: [],
//     temps: [],
//     new_users: []
//   },
//   methods: {
//     kickUser: function (_id) {
//       for (var i in this.users) {
//         if (this.users[i]._id === _id) {
//           this.users.splice(i, 1);
//         }
//       }
//       users.remove(_id);
//       for (var channel of this.channels) {
//         for (var user in channel.users) {
//           if (user === _id) {
//             channel.users.splice(_id, 1);
//             channels.update(channel._id, channel);
//           }
//         }
//       }
//     },
//     kickTemp: function (_id) {
//       for (var i in this.temps) {
//         if (this.temps[i]._id === _id) {
//           this.temps.splice(i, 1);
//         }
//       }
//       temps.remove(_id);
//       for (var channel of this.channels) {
//         for (var user in channel.users) {
//           if (user === _id) {
//             channel.users[_id] = undefined;
//             channels.update(channel._id, channel);
//           }
//         }
//       }
//     },
//     addUser: function (user) {
//       console.log(user)
//       user.newuser = false;
//       temps.update(user._id, user);
//     },
//     removeChannel: function (_id) {
//       channels.remove(_id)
//       if (this.channels[this.sel_channel]._id === _id) this.sel_channel = 0
//       /*for (var i in this.channels) {
//         if (this.channels[i]._id === _id) {
//           this.channels.splice(i, 1);
//         }
//       }*/
//     },
//     changeChannel: function (index) {
//       if (index > this.channels.length-1) this.sel_channel = this.channels.length-1;
//       else this.sel_channel = index;
//     },
//     displayUser: function (_id) {
//       if (this.channels.length === 0) return false;
//       for (var member in this.channels[this.sel_channel].users) {
//         if (member === _id) return true;
//       }
//       return false;
//     },
//     removeMember: function (_id) {
//       var users = this.channels[this.sel_channel].users;
//       users[_id] = undefined;
//       this.updateChannel();
//     },
//     registerChannel: function () {
//       channels.create({name: this.new_channel, users: {}})
//       /*this.channels.push({
//         _id: 'id'+(this.channels.length-1),
//         name: this.new_channel,
//         users: {}
//       });*/

//       this.new_channel = '';
//       this.sub_interface = false;
//     },
//     openRegisterChannel: function () {
//       console.log('open');
//       $('#add_channel').modal('open');
//     },
//     dropped: function (event) {
//       var _id = event.dataTransfer.getData('text/plain');
//       var users = this.channels[this.sel_channel].users ;
//       var speaking = !(event.ctrlKey);
//       if (users[_id] === undefined) {
//         Vue.set(users, _id, speaking);
//         this.updateChannel();
//       }
//     },
//     dragging: function (user, event) {
//       event.dataTransfer.setData('text/plain', user._id);
//     },
//     updateChannel: function () {
//       channels.update(this.channels[this.sel_channel]._id, this.channels[this.sel_channel]);
//     }
//   }
// })




// var key_order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
// var ptt_ignore = [];
// var ptt_pushed = [];


// var controls = new Vue({
//   el: '#control',
//   data: {
//     registerFailed: false,
//     muted: false,
//     self: {
//       _id: '',
//       name: '',
//       client: '',
//       ip: '',
//       admin: false,
//       newuser: false
//     },
//     channels: []
//   },
//   methods: {
//     pushToTalk: function (key, direction) {
//       var channel = key_order.indexOf(key);
//       var ignore = ptt_ignore.indexOf(channel);
//       var pushed = ptt_pushed.indexOf(channel);

//       if (admin !== undefined) if (admin.sub_interface === true) return;
      
//       // if channel is talking already, ignore down and incoming up
//       if (channel === -1 || ignore !== -1) {
//         delete ptt_ignore[ignore]
//         return
//       }
//       if (!this.channels[channel] || this.muted) return;
//       if (this.channels[channel].muted) return;
//       if (direction === 'down' && this.channels[channel].talking && pushed === -1) {
//         ptt_ignore.push(channel)
//         return;
//       }
      
//       // if down was pushed before, if up then disable, if down then enable
//       if (direction === 'down' && pushed !== -1) return;
//       else if (pushed !== -1) {
//         delete ptt_pushed[pushed];
//         this.channels[channel].talking = false;
//         sessions[this.channels[channel]._id].mute();
//       } else if (direction === 'down') {
//         this.channels[channel].talking = true;
//         sessions[this.channels[channel]._id].unmute();
//         ptt_pushed.push(channel)
//       }
      
//     },
//     toggleMute: function() {
//       if (this.muted) {
//         for (var channel of this.channels) {
//           if (channel.talking) sessions[channel._id].unmute();
//         }
//         this.muted = false;
//       } else {
//         for (var session in sessions) {
//           sessions[session].mute();
//         }
//         this.muted = true;
//       }
//     },
//     toggleChannel: function (channel) {
//       if (channel.talking) {
//         sessions[channel._id].unmute();
//       } else {
//         sessions[channel._id].mute();
//       }
//     }
//   }
// })