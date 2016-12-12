'use strict';

const assert = require('assert');
const app = require('../../../src/app');

describe('temp service', function() {
  it('registered the temps service', () => {
    assert.ok(app.service('temps'));
  });
});
