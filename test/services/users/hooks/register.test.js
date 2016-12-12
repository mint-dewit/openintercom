'use strict';

const assert = require('assert');
const register = require('../../../../src/services/users/hooks/register.js');

describe('users register hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    register()(mockHook);

    assert.ok(mockHook.register);
  });
});
