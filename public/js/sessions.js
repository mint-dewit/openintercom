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

/*
This class allows for easy handling of sipjs sessions. 
Especially useful because we need to mute the session upon initialization.
*/
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