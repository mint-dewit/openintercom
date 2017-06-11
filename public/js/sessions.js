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
This class allows for easy handling of webrtc sessions. 
*/
var session = class Session {
	constructor (connections, channelId, clientId) {
		console.log('start session');
		this.connections = connections;
		let self = this;

		this.connection = new RTCPeerConnection({iceServers: [{urls: 'stun:stun.l.google.com:19302'}]})

		navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {
			this.connection.addStream(stream)

			this.connection.createOffer().then((offer) => {
				self.capabilities = require('sdp-transform').parse(offer.sdp);
				console.log(self.capabilities)
				return connections.create({channelId: channelId, clientId: clientId, connectionState: 'setCapabilities', clientCapabilities: self.capabilities}).then((result) => {
					this._id = result._id;
				}, err => console.log(err))
			});
		},
		err => console.log(err));
		
		connections.on('updated', (connectionObject) => {
			if (connectionObject._id != this._id) return;
			if (connectionObject.connectionState === 'setServerOffer') {
				console.log('set remote description', connectionObject)
				this.connection.setRemoteDescription(connectionObject.serverOffer)
				.then(() => {
					this.connection.createAnswer()
					.then((answer) => {
						console.log('set local description & send offer');
						this.connection.setLocalDescription(answer)
						connectionObject.clientOffer = answer;
						connectionObject.connectionState = 'setClientOffer';
						connections.update(connectionObject._id, connectionObject);
					})
				})
			}
		})

		this.connection.onaddstream = function (ev) {
			$('#remoteAudio').append('<audio id="remoteAudio-'+self._id+'"></audio>');
			$('#remoteAudio-'+self._id)[0].src = window.URL.createObjectURL( ev.stream );
			$('#remoteAudio-'+self._id)[0].play();	

			//self.mute();
			let chan = () => { for (let channel of controls.channels) { if (channel._id === channelId) return channel } }
			if (chan().talking === false) self.mute();

			console.log('received stream', self._id, ev.stream);
		}
	}
	mute () {
		console.log('mute session');
		this.connection.getLocalStreams()[0].getAudioTracks()[0].enabled = false;
	}
	unmute () {
		console.log('unmute session');
		this.connection.getLocalStreams()[0].getAudioTracks()[0].enabled = true;
	}
	end () {
		console.log('end session');
		this.connection.close();
	}
}