'use strict';

const path = require('path');
const NeDB = require('nedb')

module.exports = function(app) {
  return function(req, res, next) {
    const db = new NeDB({
    	filename: path.join(app.get('nedb'), 'users.db'),
    	autoload: true
  	});

  	db.find({}, (err, docs) => {
  		if (docs.length === 0 && req.query.user && req.query.password) {
  			console.log('create first user: ', req.query.user, req.query.password);
  			
  			var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
  			if (ip === '::1') ip = 'localhost';
  			else if (ip.substr(0,7) === '::ffff:') ip = ip.split(':')[3];

  			var user = {
          name: req.query.user,
          password: req.query.password, 
          client: req.useragent.isMobile ? 'mobile' : req.useragent.isTablet ? 'tablet' : 'desktop',
          ip: ip,
          admin: true,
          online: false,
          newuser: false
  			}

  			app.service('users').create(user).then(user => console.log(user))
  			// db.insert(user)
  		}
  	})

    next();
  };
};
