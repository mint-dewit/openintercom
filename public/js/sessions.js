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

var sessionHandler = class sessionHandler {
	constructor (options) {
		this.UA = new SIP.UA(options);
		this.sessions = {};
		this.newSession = function (channel) {
			this.sessions[channel._id] = new session(this.UA, channel.room, options);
		}
		this.endSession = function (channel) {
			for (id in this.sessions) {
				if (id === channel._id) sessions[id].end();
			}
		};
	}
}

var session = class Session {
	constructor (ua, room, config) {
		this.session = ua.invite(room.toString(), options)
		this.session.on('accepted', () => {console.log('connection accepted', this); this.session.mute()});
	}
	mute () {
		this.session.mute();
	}
	unmute () {
		this.session.unmute();
	}
	end () {
		this.session.bye();
	}
}