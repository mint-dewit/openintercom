'use strict';

// src/services/user/hooks/freeswitch.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const defaults = {};
const fs = require('fs');
const esl = require('esl');
const xml2js = require('xml2js');
var freeswitchObject;

fs.readFile('/etc/freeswitch/directory/default.xml', 'utf-8', (err, data) => {
	if (err) console.log('error reading FS config', err);
	
	xml2js.parseString(data, (err, result) =>{
		if (err) console.log('error parsing js from xml', err);
		freeswitchObject = result;
	})
});

module.exports = function(options) {
  options = Object.assign({}, defaults, options);

  return function(hook) {
  	return new Promise((resolve, reject) => {
  		freeswitchObject.include.domain[0].groups[0].group[0].users.push({user: 
  			[{$: 
  				{id: hook.result._id}, 
  				param:[{$:
  					{name: 'password', value: '4321'}
  				}]
  			}]
  		});
  		const builder = new xml2js.Builder();
  		const xml = builder.buildObject(freeswitchObject);

  		fs.writeFile('/etc/freeswitch/directory/default.xml', xml, (err, data) => {
  			if (err) console.log(err);
  			resolve(hook);
  		})
  	})
    hook.freeswitch = true;
  };
};
