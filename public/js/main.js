var key_order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
var ptt_ignore = [];
var ptt_pushed = [];
var authenticated = false;

const socket = io();

const app = feathers()
  .configure(feathers.socketio(socket))
  .configure(feathers.hooks())
  .configure(feathers.authentication({
    storage: window.localStorage
  }));

const users = app.service('users');
const channels = app.service('channels');

app.authenticate()
  .then(res => {
    admin.self = res.data;
    controls.self = res.data;
    authenticated = true;
    users.find()
      .then(res => admin.users = res)
    channels.find()
      .then(res => {
        admin.channels = res.data;
        for (channel of res.data) {
          for (user in channel.users) {
            if (user === controls.self._id) {
              controls.channels.push({
                _id: channel._id,
                name: channel.name,
                talking: false,
                muted: !(channel.users[user])
              })
            }
          }
        }
      })
  })
  .catch(error => {
    if (error.code === 401) window.location.href = '/login.html'
  });

channels.on('created', res => admin.channels.push(res));
channels.on('removed', res => {
  for (channel in admin.channels) {
    if (admin.channels[channel]._id === res._id) {
      admin.channels.splice(channel, 1);
    }
  }
  for (channel in controls.channels) {
    if (controls.channels[channel]._id === res._id) {
      controls.channels.splice(channel, 1)
    }
  }
});
channels.on('updated', res => {
  for (chan in admin.channels) {
    if (admin.channels[chan]._id === res._id) {
      Vue.set(admin.channels, chan, res);
    }
  }
  /*
    1 we already have channel
      1 we are still in channel => update talky
      2 we are no longer in channel => remove channel
    2 we do not have channel
      1 we are in channel => add channel
  */
  
  var hasChannel;
  var resHasId = res.users[controls.self._id] !== undefined;
  for (var channel of controls.channels) {
    if (channel._id === res._id) {
      hasChannel = channel;
    }
  }

  if (hasChannel) {
    if (resHasId) {
      hasChannel.muted = !(res.users[controls.self._id])
      if (hasChannel.muted && hasChannel.talking) hasChannel.talking = false;
    }
    else {
      for (i in controls.channels) {
        if (controls.channels[i]._id === res._id) controls.channels.splice(i, 1);
      }
    }
  } else {
    if (resHasId) {
      controls.channels.push({
        _id: res._id,
        name: res.name,
        talking: false,
        muted: !(res.users[controls.self._id])
      })
    }
  }
})

var admin = new Vue({
  debug: true,
  el: '#admin',
  data: {
    sel_channel: 0,
    new_channel: '',
    sub_interface: false,
    channels: [],
    self: {
      _id: '',
      name: '',
      client: '',
      ip: '',
      admin: true
    },
    users: [],
    new_users: []
  },
  methods: {
    kickUser: function (_id) {
      for (var i in this.users) {
        if (this.users[i]._id === _id) {
          this.users.splice(i, 1);
        }
      }
      // TODO: create middleware to remove from channels
    },
    removeChannel: function (_id) {
      channels.remove(_id)
      if (this.channels[this.sel_channel]._id === _id) this.sel_channel = 0
      /*for (var i in this.channels) {
        if (this.channels[i]._id === _id) {
          this.channels.splice(i, 1);
        }
      }*/
    },
    changeChannel: function (index) {
      if (index > this.channels.length-1) this.sel_channel = this.channels.length-1;
      else this.sel_channel = index;
    },
    displayUser: function (_id) {
      if (this.channels.length === 0) return false;
      for (var member in this.channels[this.sel_channel].users) {
        if (member === _id) return true;
      }
      return false;
    },
    removeMember: function (_id) {
      var users = this.channels[this.sel_channel].users;
      users[_id] = undefined;
      this.updateChannel();
    },
    registerChannel: function () {
      channels.create({name: this.new_channel, users: {}})
      /*this.channels.push({
        _id: 'id'+(this.channels.length-1),
        name: this.new_channel,
        users: {}
      });*/

      this.new_channel = '';
      this.sub_interface = false;
    },
    dropped: function (event) {
      var _id = event.dataTransfer.getData('text/plain');
      var users = this.channels[this.sel_channel].users;
      var speaking = !(event.ctrlKey);
      if (users[_id] === undefined) {
        Vue.set(users, _id, speaking);
        this.updateChannel();
      }
    },
    dragging: function (user, event) {
      event.dataTransfer.setData('text/plain', user._id);
    },
    updateChannel: function () {
      channels.update(this.channels[this.sel_channel]._id, this.channels[this.sel_channel]);
    }
  }
})

controls = new Vue({
  el: '#control',
  data: {
    muted: false,
    self: {
      _id: '',
      name: '',
      client: '',
      ip: '',
      admin: true
    },
    channels: []
  },
  methods: {
    pushToTalk: function (key, direction) {
      var channel = key_order.indexOf(key);
      var ignore = ptt_ignore.indexOf(channel);
      var pushed = ptt_pushed.indexOf(channel);

      if (admin.sub_interface === true) return;
      
      // if channel is talking already, ignore down and incoming up
      if (channel === -1 || ignore !== -1) {
        delete ptt_ignore[ignore]
        return
      }
      if (this.channels[channel].muted) return;
      if (direction === 'down' && this.channels[channel].talking && pushed === -1) {
        ptt_ignore.push(channel)
        return;
      }
      
      // if down was pushed before, if up then disable, if down then enable
      if (direction === 'down' && pushed !== -1) return;
      else if (pushed !== -1) {
        delete ptt_pushed[pushed];
        this.channels[channel].talking = false;
      } else if (direction === 'down') {
        this.channels[channel].talking = true;
        ptt_pushed.push(channel)
      }
      
    }
  }
})

$('.modal').modal();

$(document).on('keydown', (event) => {controls.pushToTalk(event.key, 'down')});
$(document).on('keyup', (event) => {controls.pushToTalk(event.key, 'up')});

var config = {
  // Replace this IP address with your FreeSWITCH IP address
  uri: 'balte@192.168.0.105',

  // Replace this IP address with your FreeSWITCH IP address
  // and replace the port with your FreeSWITCH port
  wsServers: 'wss://192.168.0.105:7443',

  // FreeSWITCH Default Username
  authorizationUser: '1000',

  password: '4321',

  iceCheckingTimeout: 180000
};

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

// var ua = new SIP.UA(config);
// var session = ua.invite('3300', options)
// var session = ua.invite('9195', options)
// session.mute()

$('input[type=text]').on('click', ()=>{admin.sub_interface = true});
$('input[type=text]').on('focusout', ()=>{admin.sub_interface = false});