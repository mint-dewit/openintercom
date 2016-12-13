'use strict';

const fs = require('fs');
const https = require('https')
const app = require('./app');
const port = app.get('port');

const server = https.createServer({
	key: fs.readFileSync('certs/key.pem'),
	cert: fs.readFileSync('certs/cert.pem')
}, app).listen(port);

app.setup(server);

// app.listen(port);

server.on('listening', () =>
  console.log(`Feathers application started on ${app.get('host')}:${port}`)
);