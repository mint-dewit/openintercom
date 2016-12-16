'use strict';

const assert = require('assert');
const freeswitch = require('../../../../src/services/temp/hooks/freeswitch.js');

describe('temp freeswitch hook', function() {
  it('hook can be used', function() {
    const mockHook = {
      type: 'before',
      app: {},
      params: {},
      result: {},
      data: {}
    };

    freeswitch()(mockHook);

    assert.ok(mockHook.freeswitch);
  });
});
