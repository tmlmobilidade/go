import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { EventRestrictionSchema } from '../src/network/rules.js';

/* * */

const restriction = {
	_id: 'restriction',
	all_day: true,
	dates: [],
	event: { id: 'event', title: 'Event' },
	kind: 'event_restriction',
	lines_mode: 'all',
};

describe('event restriction time windows', () => {
	it('accepts its own empty-window defaults for all-day restrictions', () => {
		const parsed = EventRestrictionSchema.parse(restriction);
		assert.equal(parsed.start_time, '');
		assert.equal(parsed.end_time, '');
	});

	it('allows explicit timepoints without a window', () => {
		const parsed = EventRestrictionSchema.parse({ ...restriction, all_day: false, timepoints: ['06:00', '07:00'] });
		assert.deepEqual(parsed.timepoints, ['06:00', '07:00']);
		assert.equal(parsed.start_time, '');
		assert.equal(parsed.end_time, '');
	});

	it('continues validating nonempty window times', (context) => {
		context.mock.method(console, 'warn', () => undefined);
		assert.equal(EventRestrictionSchema.safeParse({ ...restriction, end_time: '13:00', start_time: '11:00' }).success, true);
		assert.equal(EventRestrictionSchema.safeParse({ ...restriction, start_time: 'bad' }).success, false);
	});
});
