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

    console.log('try activate admin', req.body);
    if (req.body && req.body._id && req.body.key && req.body.password) {
      tokensDb.find({temp: req.body._id, key: req.body.key}, (err, docs) => {
        if (err) { 
          res.status(203).send('Something went wrong during verification!'); 
          res.set('connection', 'close');
          console.log('err during verif', err) }
        else {
          console.log('token verified!')
          tempsDb.find({_id: req.body._id}, function(err, docs) {
            console.log('register user', docs[0]);
            var user = docs[0];
            user._id = undefined;
            user.password = req.body.password;
            app.service('users').create(user).then(() => {
              res.status(200);
              res.set('connection','close');
              res.end();
            });
            tempsDb.remove({_id: req.body._id}, {}, () => console.log('temp removed.'));
            tokensDb.remove({temp: req.body._id, key: req.body.key}, {}, () => console.log('token removeds'));
          })
        }
      })
    }
  };
};
