'use strict'

var key_order = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
var ptt_ignore = [];
var ptt_pushed = [];

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

$('.modal').modal({dismissible: false});

channels.find()
	.then(channels => {
		if (user_id) {
			console.log('machine registered: '+user_id);
			temps.get(user_id)
				.then(res => {
					if (res.newuser === true) $('#newUser').modal('open');
					else {
						for (let channel of channels) {
							if (channel.users[res._id] !== undefined) controls.channels.push({
								_id: channel._id,
								name: channel.name,
								talking: false,
								muted: !(channel.users[res._id]),
							});
						}
					}
					controls.self = res;
				})
				.catch(() => {
					window.localStorage.removeItem('_id');
					window.location.reload();
				})
		} else {
			// create a user!
			console.log('no user history, register as new');

			$('#newUser').modal('open');

			const platform = new MobileDetect(window.navigator.userAgent);
			const client = platform.tablet() ? 'tablet' : platform.mobile() ? 'mobile' : 'desktop';

			temps.create({client: client})
				.then(res => {
					console.log(res);
					localStorage.setItem('_id', res._id);
					controls.self = res;
				})
				.catch(error => {
					controls.registerFailed = true;
					console.log(error);
				})
		}
	})

temps.on('updated', (res) => {
	if (res._id === controls.self._id) {
		/*if (controls.self.admin === false && res.admin) {
			$('#newadmin').modal('open');
		}*/
		if (controls.self.newuser && res.newuser === false) {
			$('#newUser').modal('close');
			channels.find()
				.then(channels => {
					for (let channel of channels) {
						if (channel.users[res._id] !== undefined) controls.channels.push({
							_id: channel._id,
							name: channel.name,
							talking: false,
							muted: !(channel.users[res._id]),
						});
					}
				});
		}
		controls.self = res;
	}
})
temps.on('removed', (res) => {
	if (res._id === user_id) {
		window.localStorage.removeItem('_id');
		$('#delUser').modal('open');
	}
})

channels.on('updated', res => {
	var hasChannel;
	var resHasId = (res.users[user_id] === undefined) ? false : true;

	for (var channel of controls.channels) hasChannel = (channel._id === res._id) ? channel : hasChannel;

  if (hasChannel) {
    if (resHasId) {
      hasChannel.muted = !(res.users[controls.self._id])
      if (hasChannel.muted && hasChannel.talking) hasChannel.talking = false;
    }
    else {
      for (var i in controls.channels) {
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

/*app.authenticate()
.then((res) => {
	admin.self = res;
	if (res.newuser) {
		$('#newUser').modal('open');
	}
})
.catch(error => {
	console.log('no login:', error.code, 'register new user!');

	$('#newUser').modal('open');

	const hd1 = new Jen(true);
	const pwd = hd1.password(20,30);
	const platform = new MobileDetect(window.navigator.userAgent);
	const client = platform.tablet() ? 'tablet' : platform.mobile() ? 'mobile' : 'desktop';
	users.create({password:pwd,client:client})
		.then(user => {
			controls.self = user;
			app.authenticate({type: 'local', 'name':user.name, 'password':pwd}); // fuck shit when user leaves before register. we end up with trassssh
		})
		.catch(error => {
			controls.registerFailed = true;
		})
})

users.on('updated', (res) => {
	if (res._id === controls.self._id) {
		if (controls.self.admin === false && res.admin) {
			$('#newadmin').modal('open');
		}
		if (controls.self.newuser && res.newuser === false) {
			$('#newuser').modal('close');
		}
		controls.self = res;
	}
})*/

const controls = new Vue({
	el: '#vue',
  data: {
  	registerFailed: false,
    muted: false,
    self: {
      _id: '',
      name: '',
      client: '',
      ip: '',
      admin: false,
      newuser: true
    },
    channels: []
  },
  methods: {
    pushToTalk: function (key, direction) {
      var channel = key_order.indexOf(key);
      var ignore = ptt_ignore.indexOf(channel);
      var pushed = ptt_pushed.indexOf(channel);
      
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
      
    },
    makeAdmin: function () {
    	users.update(this.self._id, this.self).then(() => window.location.href = '/admin.html')
    }
  }
})

$(document).on('keydown', (event) => {controls.pushToTalk(event.key, 'down')});
$(document).on('keyup', (event) => {controls.pushToTalk(event.key, 'up')});

$('.modal').modal({dismissible: false});