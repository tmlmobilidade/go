/* * */

import assert from 'node:assert/strict';

import { COMPARABLE_WEEKDAY_SAMPLE_SIZE, getComparableOperationalDates } from '../comparable-operational-dates.js';
import { median, quantile } from '../statistics/quantile.js';
import { validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

assert.equal(COMPARABLE_WEEKDAY_SAMPLE_SIZE, 8);
assert.deepEqual(
	getComparableOperationalDates(validateOperationalDateInt(20260818)),
	[20260811, 20260804, 20260728, 20260721, 20260714, 20260707, 20260630, 20260623],
);
assert.deepEqual(
	getComparableOperationalDates(validateOperationalDateInt(20260105), 3),
	[20251229, 20251222, 20251215],
);

assert.equal(median([10, 20, 30]), 20);
assert.equal(quantile([10, 20, 30, 40], 0.25), 17.5);
assert.equal(median([]), null);

console.log('comparable-operational-dates tests passed.');

/* * */
