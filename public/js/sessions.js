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

		this.connection = new RTCPeerConnection({iceServers: [{urls: 'stun:stun.l.google.com:19302'}]})
		navigator.mediaDevices.getUserMedia({audio: true}).then(stream => {this.connection.addStream(stream)});
		this.connection.createOffer({offerToReceiveAudio: 1}).then((offer) => {
			this.capabilities = require('sdp-transform').parse(offer.sdp);
			return connections.create({channelId: channelId, clientId: clientId, connectionState: 'setCapabilities', clientCapabilities: this.capabilities}).then((result) => {
				this._id = result._id;
			}, err => console.log(err))
		});
		
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
			console.log('stream', ev.stream);
			$('#remoteAudio')[0].src = window.URL.createObjectURL( ev.stream );
			$('#remoteAudio')[0].play();
		}
	}
	mute () {
		console.log('mute session');
		// @todo
	}
	unmute () {
		console.log('unmute session');
		// @todo
	}
	end () {
		console.log('end session');
		connections.remove(this._id);
	}
}