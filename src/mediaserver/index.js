const mediasoup = require("mediasoup");
const RTCPeerConnection = mediasoup.webrtc.RTCPeerConnection;

const mediaServer = mediasoup.Server();
const channels = {};

// Room options.
const roomOptions = {
  mediaCodecs : [
    {
      kind        : "audio",
      name        : "audio/opus",
      clockRate   : 48000,
      payloadType : 100
    }
  ]
};

module.exports = function () {
    const app = this;

    app.mediaHooks = {
        createRoom: function (id) {
            console.log('create mediaroom ', id);
            mediaServer.createRoom(roomOptions)
            .then((mediaRoom) => {
                channels[id] = {
                    mediaRoom: mediaRoom,
                    clients: {}
                };
            })
        },

        removeRoom: function (id) {
            console.log('remove mediaroom', id);
            channels[id].mediaRoom.close();
            delete channels[id];
        },

        handleConnectionUpdate: function (connectionObject) {
            console.log('handle connection', connectionObject._id);
            let channel = channels[connectionObject.channelId];
            if (!channel) return console.log('error: tried to make connection to non-existent channel.');

            let client = channel.clients ? channel.clients[connectionObject.clientId] : undefined;
            if (!client) {
                console.log('initiate connection');
                channel.clients[connectionObject.clientId] = {}
                client = channel.clients[connectionObject.clientId];

                client.mediaPeer = channel.mediaRoom.Peer(connectionObject.clientId);
                client.peerConnection = new RTCPeerConnection({
                    peer: client.mediaPeer,
                    usePlanB: true
                })

                client.peerConnection.on('close', () => {
                    console.log('RTCPeer closed', connectionObject._id);
                    app.service('connections').remove(connectionObject._id);
                })

                client.peerConnection.on('negotiationneeded', () => {
                    console.log('renegotiate', connectionObject._id);
                    app.service('connections').get(connectionObject._id).then((connectionObject) => {
                        connectionObject.connectionState = 'negotiationNeeded';
                        app.service('connections').update(connectionObject._id, connectionObject);
                    })
                })
            // @todo: negotionation needed event
            }


            if (connectionObject.connectionState === 'setCapabilities') {
                console.log('start connection', connectionObject._id);
                // set capabilities
                client.peerConnection.setCapabilities(connectionObject.clientCapabilities)
                .then(() => {
                    console.log('create offer', connectionObject._id);
                    // create offer for client
                    client.peerConnection.createOffer({offerToReceiveAudio: 1})
                    .then((desc) => {
                        return client.peerConnection.setLocalDescription(desc);
                    })
                    // send offer
                    .then(() => {
                        connectionObject.serverOffer = client.peerConnection.localDescription.serialize();
                        connectionObject.connectionState = 'setServerOffer';
                        console.log('set server offer');
                        app.service('connections').update(connectionObject._id, connectionObject);
                    });
                },
                err => console.log(err))
            }
            else if (connectionObject.connectionState === 'setClientOffer') {
                // set remoteSdp
                client.peerConnection.setRemoteDescription(connectionObject.clientOffer);
                connectionObject.connectionState = 'connected';
                app.service('connections').update(connectionObject._id, connectionObject);
            }
            else if (connectionObject.connectionState === 'negotiationNeeded') {
                console.log('create offer', connectionObject._id);
                // create offer for client
                client.peerConnection.createOffer({offerToReceiveAudio: 1})
                .then((desc) => {
                    return client.peerConnection.setLocalDescription(desc);
                })
                // send offer
                .then(() => {
                    connectionObject.serverOffer = client.peerConnection.localDescription.serialize();
                    connectionObject.connectionState = 'setServerOffer';
                    console.log('set server offer');
                    app.service('connections').update(connectionObject._id, connectionObject);
                });
            }
        },

        removedConnection: function (connectionObject) {
            console.log('removed connection', connectionObject._id)
            channels[connectionObject.channelId].clients[connectionObject.clientId].mediaPeer.close();
            delete channels[connectionObject.channelId].clients[connectionObject.clientId];
        }
    }
}

