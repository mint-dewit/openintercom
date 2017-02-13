'use strict';

const assert = require('assert');
const populateToken = require('../../../../src/services/token/hooks/populateToken.js');

describe('token populateToken hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    populateToken()(mockHook);

    assert.ok(mockHook.populateToken);
  });
});
