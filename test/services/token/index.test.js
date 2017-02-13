'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('token service', function() {
  it('registered the tokens service', () => {
    assert.ok(app.service('tokens'));
  });
});
