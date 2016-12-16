'use strict';

// Add any common hooks you want to share across services in here.
// 
// Below is an example of how a hook is written and exported. Please
// see http://docs.feathersjs.com/hooks/readme.html for more details
// on hooks.

const fs = require('fs');
const net = require('net');
const xml2js = require('xml2js');

function fsUpdate(hook) {
	return new Promise((resolve, reject) => {
		var client = new net.Socket();
		client.connect(8021, '127.0.0.1', () => {
			client.write('auth ClueCon\n\napi reloadxml\n\n');
			client.destroy();
			resolve(hook);
		})
	})
}

exports.fsAddUser = function(options) {
  return function(hook) {
  	return new Promise((resolve, reject) => {
			fs.readFile('/etc/freeswitch/directory/default.xml', 'utf-8', (err, data) => {
				if (err) console.log('error reading FS config', err);
				
				xml2js.parseString(data, (err, result) =>{
					if (err) console.log('error parsing js from xml', err);

					result.include.domain[0].groups[0].group[0].users[0].user.push({$: 
		  				{id: hook.result._id}, 
		  				params: [{
		  					param:[{$:
			  					{name: 'password', value: '4321'}
			  				}]
		  				}],
		  				variables: [{
		  					variable: [{$:
		  						{name: 'user_context', value: 'default'}
		  					}]
		  				}]
			  		});

					const builder = new xml2js.Builder();
					const xml = builder.buildObject(result);

					fs.writeFile('/etc/freeswitch/directory/default.xml', xml, (err, data) => {
						if (err) console.log(err);
						console.log('write directory')
						fsUpdate(hook).then((hook)=>{console.log('resolve hook!'); resolve(hook);});
					})
				})
			});
  	})
  };
};
