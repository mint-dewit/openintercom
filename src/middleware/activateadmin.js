'use strict';

const path = require('path');
const NeDB = require('nedb')

module.exports = function(app) {
  return function(req, res, next) {
    const tokensDb = new NeDB({
    	filename: path.join(app.get('nedb'), 'tokens.db'),
    	autoload: true
  	});
    const tempsDb = new NeDB({
    	filename: path.join(app.get('nedb'), 'temps.db'),
    	autoload: true
  	});

    console.log(req.body);
    if (req.body && req.body._id && req.body.key && req.body.password) {
      tokensDb.find({user: req.body._id, key: req.body.key}, (err, docs) => {
        if (err) { res.status(203).send('Something went wrong during verification!') }
        else {
          tempsDb.find({_id: req.body._id, function(err, docs) {
            user = docs[0];
            user.password = req.body.password;
            app.service('users').create(user).then(() => res.status(200));
            tempsDb.remove({_id: req.body._id});
            tokensDb.remove({user: req.body._id, key: req.body.key});
          }})
        }
      })
    }

    next();
  };
};
