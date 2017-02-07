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

var authenticated = false;

app.authenticate()
  .then(res => {
    admin.self = res.data;
    controls.self = res.data;
    authenticated = true;

    config = {
      uri: res.data._id+'@192.168.0.105',
      wsServers: 'wss://192.168.0.105:7443',
      authorizationUser: res.data._id,
      password: '4321',
      iceCheckingTimeout: 180000,
      log: {builtinEnabled: false}
    }
    ua = new SIP.UA(config);

    users.find()
      .then(res => {
        for (user of res) {
          admin.users.push(user);
        }
      })

    temps.find()
      .then(res => {
        for (user of res) {
          if (user.newuser === false) {
            admin.temps.push(user);
          } else {
            admin.new_users.push(user);
          }
        }
      })

    channels.find()
      .then(res => {
        console.log(res);
        admin.channels = res;
        for (channel of res) {
          for (user in channel.users) {
            if (user === controls.self._id) {
              sessions[channel._id] = new session(ua, channel.room, config) /*ua.invite(channel.room.toString(), options);
              sessions[channel._id].mute();*/
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
      if (hasChannel.muted) sessions[res._id].mute();
    }
    else {
      for (i in controls.channels) {
        if (controls.channels[i]._id === res._id) {
          controls.channels.splice(i, 1);
          sessions[res._id].bye();
        }
      }
    }
  } else {
    if (resHasId) {
      sessions[res._id] = new session(ua, res.room, options); // ua.invite(res.room.toString(), options);
      controls.channels.push({
        _id: res._id,
        name: res.name,
        talking: false,
        muted: !(res.users[controls.self._id])
      })
    }
  }
})

users.on('updated', res => {
  for (let user of admin.users) {
    if (user._id === res.id) user = res;
  }
})
users.on('removed', res => {
  for (var u in admin.users) {
    if (admin.users[u]._id === res._id) {
      admin.users.splice(u,1);
    }
  }
})

temps.on('updated', res => {
  for (var user in admin.new_users) {
    if (admin.new_users[user]._id === res._id) {
      console.log('user '+res._id+' was updated');
      if (res.newuser === false) {
        admin.temps.push(res);
        admin.new_users.splice(user, 1);
      }
    }
  }
})
temps.on('created', res => {
  console.log(res);
  admin.new_users.push(res);
})
temps.on('removed', res => {
  for (var u in admin.temps) {
    if (admin.temps[u]._id === res._id) {
      admin.temps.splice(u,1);
    }
  }
})