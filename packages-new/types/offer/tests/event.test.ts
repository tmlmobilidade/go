import { strict as assert } from 'node:assert';
import { describe, it } from 'node:test';

import { CreateEventSchema, EventSchema } from '../src/dates/event.js';

/* * */

const event = {
	_id: 'event',
	agency_ids: ['agency'],
	code: 'EVENT',
	created_at: 1_792_368_000_000,
	created_by: 'user',
	title: 'Event',
	updated_at: 1_792_368_000_000,
};

describe('stored event contracts', () => {
	it('does not generate a stored association field', () => {
		assert.equal('associated_patterns' in EventSchema.parse(event), false);
	});

	it('ignores derived associations supplied in a legacy or client document', () => {
		const associatedPatterns = [{ _id: 'pattern', code: 'P1', headsign: 'Destination', line_id: 'line', route_id: 'route' }];
		const input = { ...event, associated_patterns: associatedPatterns };
		assert.equal('associated_patterns' in EventSchema.parse(input), false);
	});

	it('preserves create validation and excludes server and populated fields', () => {
		const input = { agency_ids: ['agency'], code: 'EVENT', created_by: 'user', title: 'Event' };
		assert.equal(CreateEventSchema.safeParse({ ...input, code: 'lowercase' }).success, false);
		assert.equal(CreateEventSchema.safeParse({ ...input, agency_ids: [] }).success, false);
		const parsed = CreateEventSchema.parse({ ...input, _id: 'ignored', associated_patterns: [], created_at: 1 });
		assert.equal('_id' in parsed, false);
		assert.equal('associated_patterns' in parsed, false);
		assert.equal('created_at' in parsed, false);
		assert.equal(parsed.created_by, 'user');
	});
});
