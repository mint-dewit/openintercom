const socket = io();

const app = feathers()
	.configure(feathers.socketio(socket))
	.configure(feathers.hooks())
	.configure(feathers.authentication({
		storage: window.localStorage
	}));

const channels = app.service('channels');
const temps = app.service('temps');
const connections = app.service('connections');

/**
 * upon page load: retrieve channels, and check if our machine has saved a user id
 */
channels.find()
	.then(channels => {
		if (user_id) {
			console.log('machine registered: ' + user_id);

			/**
			 * retrieve the saved userdata, and check if our user is registered
			 */
			temps.get(user_id)
				.then(res => {
					if (res.newuser === true) $('#newUser').modal('open');
					else {
						for (let channel of channels) {
							if (channel.users[res._id] !== undefined) {
								sessions[channel._id] = new session(connections, channel._id, res._id);
								controls.channels.push({
									_id: channel._id,
									name: channel.name,
									talking: false,
									muted: !(channel.users[res._id]),
								});
							}
						}
					}

					controls.self = res;
				})
				.catch((err) => {
					window.localStorage.removeItem('_id');
					window.location.reload();
				})
		} else {
			// create a user!
			console.log('no user history, register as new');

			$('#newUser').modal('open');

			const platform = new MobileDetect(window.navigator.userAgent);
			const client = platform.tablet() ? 'tablet' : platform.mobile() ? 'mobile' : 'desktop';

			temps.create({ client: client })
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

/**
 * non-admin user was updated. check if current user was registered, and execute logic. in any case update.
 */
temps.on('updated', (res) => {
	if (res._id === controls.self._id) {
		if (controls.self.newuser && res.newuser === false) {
			$('#newUser').modal('close');

			if (res.admin === true) {
				$('#newAdmin').modal('open');
			}


			channels.find()
				.then(channels => {
					for (let channel of channels) {
						if (channel.users[res._id] !== undefined) {
							sessions[channel._id] = new session(connections, channel._id, res._id)
							controls.channels.push({
								_id: channel._id,
								name: channel.name,
								talking: false,
								muted: !(channel.users[res._id]),
							});
						}
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

/**
 * if a channel is updated we need to check if the user is in the channel, and if the user is allowed to talk.
 */
channels.on('updated', res => {
	var hasChannel;
	var resHasId = (res.users[user_id] === undefined) ? false : true;

	for (var channel of controls.channels) hasChannel = (channel._id === res._id) ? channel : hasChannel;

	if (hasChannel) {
		if (resHasId) {
			hasChannel.muted = !(res.users[controls.self._id])
			if (hasChannel.muted && hasChannel.talking) hasChannel.talking = false;
			if (hasChannel.muted) sessions[res._id].mute();
			console.log('usr was muted by admin');
		}
		else {
			for (var i in controls.channels) {
				if (controls.channels[i]._id === res._id) {
					sessions[res._id].end();
					controls.channels.splice(i, 1);
					console.log('usr was removed from channel')
				}
			}
		}
	} else {
		if (resHasId) {
			sessions[res._id] = new session(connections, res._id, controls.self._id)
			console.log('channel was added.')
			controls.channels.push({
				_id: res._id,
				name: res.name,
				talking: false,
				muted: !(res.users[controls.self._id])
			})
		}
	}
})