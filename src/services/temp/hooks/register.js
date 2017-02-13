'use strict';

// src/services/user/hooks/register.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const defaults = {};
const error = require('feathers-errors')

module.exports = function(options) {
  options = Object.assign({}, defaults, options);

  return function(hook) {
  	return new Promise(function (resolve, reject) {
    	const req = hook.params.req;

    	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  		if (ip === '::1') ip = 'localhost';
  		else if (ip.substr(0,7) === '::ffff:') ip = ip.split(':')[3];

  		if (!(hook.data.client)) {
  			throw new error.BadRequest();
  			resolve(hook);
  		}

  		var user = {
          name: '',
          client: hook.data.client,
          ip: ip,
          online: true,
          newuser: true,
          admin: false
  		}

  		hook.data = user;
  		resolve(hook);
  	})
    hook.register = true;
  };
};
