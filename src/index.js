'use strict';

const fs = require('fs');
const esl = require('esl');
const https = require('https')
const app = require('./app');
const port = app.get('port');
const net = require('net');

const server = https.createServer({
	key: fs.readFileSync('certs/key.pem'),
	cert: fs.readFileSync('certs/cert.pem')
}, app).listen(port);

app.setup(server);

app.io.on('connection', (socket)=>{
	socket.on('disconnect', ()=>{
		var ip = socket.handshake.address;
		let clientId;
		if (ip === '::1') ip = 'localhost';
		else if (ip.substr(0,7) === '::ffff:') ip = ip.split(':')[3];
		app.service('users').find().then(res=>{
			for (var user of res) {
				if (user.ip === ip) {
					user.online = false;
					removeConnections(user._id);
					console.log('user disconnect',user._id)
					app.service('users').update(user._id, user);
				}
			}
		})
		app.service('temps').find().then(res=>{
			for (var user of res) {
				if (user.ip === ip) {
					user.online = false;
					removeConnections(user._id);
					console.log('user disconnect',user._id)
					app.service('temps').update(user._id, user);
				}
			}
		});
		let removeConnections = function (clientId) {
			app.service('connections').find().then(res => {
				for (let conn of res) {
					if (conn.clientId === clientId) {
						app.service('connections').remove(conn._id);
					}
				}
			})
		}
	});
})

server.on('listening', () =>
  console.log(`Feathers application started on ${app.get('host')}:${port}`)
);