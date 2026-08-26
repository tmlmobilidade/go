/* * */

import assert from 'node:assert/strict';

import { median, quantile } from '../quantile.js';

/* * */

const serviceDailyPercentages = [92, 94, 96, 95, 93, 97];
const pooledService = 95;
const medianService = median(serviceDailyPercentages);

assert.equal(medianService, 94.5);
assert.notEqual(medianService, pooledService);

assert.equal(median([]), null);
assert.equal(quantile([1, 2, 3, 4], 0.5), 2.5);

console.log('baseline statistics tests passed.');

/* * */
