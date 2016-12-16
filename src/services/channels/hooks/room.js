'use strict';

const NeDB = require('nedb');
const path = require('path');

// src/services/channels/hooks/room.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const defaults = {};

module.exports = function(options) {
  options = Object.assign({}, defaults, options);

  return function(hook) {
		const db = new NeDB({
			filename: path.join(hook.app.get('nedb'), 'channels.db'),
			autoload: true
		});
  	return new Promise(function(resolve) {
  		var room = 3000;

  		db.find({}, (err, docs) => {
  			room += docs.length;

	  		hook.data.room = room;
	  		resolve(hook);
  		})
  	})
    hook.room = true;
  };
};
