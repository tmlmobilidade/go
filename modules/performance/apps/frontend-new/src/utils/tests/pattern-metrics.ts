/* * */

import assert from 'node:assert/strict';

import { appendPatternMetricCodes, getPatternMetricValueByCode } from '../pattern-metrics';

/* * */

const pattern = { _id: 'U6VGG', code: '3001_0_1' };
const query = appendPatternMetricCodes(new URLSearchParams(), [pattern]);

assert.deepEqual(query.getAll('pattern_ids'), ['3001_0_1']);
assert.equal(getPatternMetricValueByCode(new Map([['3001_0_1', 468]]), pattern), 468);
assert.equal(getPatternMetricValueByCode(new Map([['U6VGG', 468]]), pattern), null);
