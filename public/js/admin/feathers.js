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
const tokens = app.service('tokens');

var authenticated = false;

/**
 * authenticate user with server
 */
app.authenticate()
  .then(res => {
    admin.self = res.data;
    controls.self = res.data;
    authenticated = true;

    config = {
      uri: res.data._id + '@' + window.location.hostname,
      wsServers: 'wss://' + window.location.hostname + ':7443',
      authorizationUser: res.data._id,
      password: '4321',
      iceCheckingTimeout: 180000,
      log: { builtinEnabled: false }
    }
    ua = new SIP.UA(config);

    /**
     * fetch admin list
     */
    users.find()
      .then(res => {
        for (user of res) {
          admin.users.push(user);
        }
      })

    /**
     * fetch user list
     */
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

    /**
     * fetch channel list
     */
    channels.find()
      .then(res => {
        admin.channels = res;
        for (channel of res) {
          for (user in channel.users) {
            if (user === controls.self._id) {
              sessions[channel._id] = new session(ua, channel.room, config);
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
    /**
     * authentication failed, return to login page
     */
    if (error.code === 401) window.location.href = '/login.html'
  });

/**
 * channel events
 */
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

  /**
   *channel logic:
   * 1 if we already have channel locally
   *   1 we are still in updated channel => update talking rights
   *   2 we are no longer in updated channel => remove channel locally
   * 2 if we do not have channel locally
   *   1 if we are in updated channel => add channel locally
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
      sessions[res._id] = new session(ua, res.room, options);
      controls.channels.push({
        _id: res._id,
        name: res.name,
        talking: false,
        muted: !(res.users[controls.self._id])
      })
    }
  }
})

/**
 * admin events
 */
users.on('updated', res => {
  for (let user of admin.users) {
    if (user._id === res.id) user = res;
  }
})
users.on('removed', res => {
  for (var u in admin.users) {
    if (admin.users[u]._id === res._id) {
      admin.users.splice(u, 1);
    }
  }
})

/**
 * user events
 */
temps.on('updated', res => {
  for (var user in admin.new_users) {
    if (admin.new_users[user]._id === res._id) {
      console.log('user ' + res._id + ' was updated');
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
      admin.temps.splice(u, 1);
    }
  }
})