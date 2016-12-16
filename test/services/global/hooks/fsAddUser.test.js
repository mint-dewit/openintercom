'use strict';

const assert = require('assert');
const fsAddUser = require('../../../../src/services/global/hooks/fsAddUser.js');

describe('global fsAddUser hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'after',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    fsAddUser()(mockHook);

    assert.ok(mockHook.fsAddUser);
  });
});
