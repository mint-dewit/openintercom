channels.find()
	.then(channels => {
		if (user_id) {
			console.log('machine registered: '+user_id);
			temps.get(user_id)
				.then(res => {
					if (res.newuser === true) $('#newUser').modal('open');
					else {
				    config = {
				      uri: res._id+'@192.168.0.105',
				      wsServers: 'wss://192.168.0.105:7443',
				      authorizationUser: res._id,
				      password: '4321',
				      iceCheckingTimeout: 180000,
      				log: {builtinEnabled: false}
				    }
				    ua = new SIP.UA(config);
						for (let channel of channels) {
							if (channel.users[res._id] !== undefined) {
								sessions[channel._id] = new session(ua, channel.room, options) // = ua.invite(channel.room.toString(), options)
								// sessions[channel._id].mute();
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

	    config = {
	      uri: res._id+'@192.168.0.105',
	      wsServers: 'wss://192.168.0.105:7443',
	      authorizationUser: res._id,
	      password: '4321',
	      iceCheckingTimeout: 180000,
      	log: {builtinEnabled: false}
	    }
	    ua = new SIP.UA(config);

			channels.find()
				.then(channels => {
					for (let channel of channels) {
						if (channel.users[res._id] !== undefined) {
							sessions[channel._id] = ua.invite(channel.room.toString(), options);
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

channels.on('updated', res => {
	var hasChannel;
	var resHasId = (res.users[user_id] === undefined) ? false : true;

	for (var channel of controls.channels) hasChannel = (channel._id === res._id) ? channel : hasChannel;

  if (hasChannel) {
    if (resHasId) {
      hasChannel.muted = !(res.users[controls.self._id])
      if (hasChannel.muted && hasChannel.talking) hasChannel.talking = false;
      if (hasChannel.muted) sessions[res._id].mute();
    }
    else {
      for (var i in controls.channels) {
        if (controls.channels[i]._id === res._id) {
        	sessions[res._id].bye();
        	controls.channels.splice(i, 1);
        }
      }
    }
  } else {
    if (resHasId) {
    	sessions[res._id] = ua.invite(res.room.toString(), options);
    	sessions[res._id].mute();
      controls.channels.push({
        _id: res._id,
        name: res.name,
        talking: false,
        muted: !(res.users[controls.self._id])
      })
    }
  }
})