import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CreateEventSchema, UpdateEventSchema } from '../src/dates/event.js';
import { EventReplacementSchema, EventRestrictionSchema, EventRuleSchema } from '../src/network/rules.js';

/* * */

const definitions = [
	{ all_day: true, dates: ['20261021'], kind: 'event_restriction', lines_mode: 'all' },
	{ dates: ['20261021'], kind: 'event_replacement', lines_mode: 'all', weekdays: [1], year_period_ids: ['school'] },
];

for (const definition of definitions) {
	test(`${definition.kind} can be stored without a duplicate parent reference`, () => {
		const created = CreateEventSchema.parse({ agency_ids: ['A'], code: 'EVENT', rules: [definition], title: 'Event' });
		assert.equal('event' in created.rules[0], false);
		assert.equal(created.rules[0].kind, definition.kind);
	});

	test(`${definition.kind} strips stale or client-supplied parent metadata on create and update`, () => {
		const rule = { ...definition, event: { id: 'wrong-event', title: 'Old title' } };
		const created = CreateEventSchema.parse({ agency_ids: ['A'], code: 'EVENT', rules: [rule], title: 'Current title' });
		const updated = UpdateEventSchema.parse({ rules: [rule] });
		assert.equal('event' in created.rules[0], false);
		assert.ok(updated.rules);
		assert.equal('event' in updated.rules[0], false);
	});
}

test('enriched scheduling rules still require their source event identity', () => {
	assert.equal(EventRestrictionSchema.safeParse(definitions[0]).success, false);
	assert.equal(EventReplacementSchema.safeParse(definitions[1]).success, false);
	for (const definition of definitions) {
		const schema = definition.kind === 'event_restriction' ? EventRestrictionSchema : EventReplacementSchema;
		const enriched = schema.parse({ ...definition, event: { id: 'parent', title: 'Current title' } });
		assert.deepEqual(enriched.event, { id: 'parent', title: 'Current title' });
		assert.equal('event' in EventRuleSchema.parse(enriched), false);
	}
});
