'use strict';

const assert = require('assert');
const room = require('../../../../src/services/channels/hooks/room.js');

describe('channels room hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    room()(mockHook);

    assert.ok(mockHook.room);
  });
});
