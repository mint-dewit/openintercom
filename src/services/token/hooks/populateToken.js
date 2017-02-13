'use strict';

var keygen = require('keygenerator');

// src/services/token/hooks/populateToken.js
//
// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/hooks/readme.html

const defaults = {};

module.exports = function(options) {
  options = Object.assign({}, defaults, options);

  return function(hook) {
    return new Promise((resolve, reject) => {
      hook.data.key = keygen.password({length: 8, forceUppercase: true});
    });
    hook.populateToken = true;
  };
};
