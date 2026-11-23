import assert from 'node:assert/strict';
import { test } from 'node:test';

import { CreatePatternSchema, PatternSchema, ResolvedPatternSchema, UpdatePatternSchema } from '../src/network/pattern.js';
import { ManualRuleSchema, PatternUpdateRuleSchema } from '../src/network/rules.js';

/* * */

const manual = {
	_id: 'manual',
	kind: 'manual',
	operating_mode: 'include',
	timepoints: ['08:00'],
	weekdays: [1],
	year_period_ids: ['school'],
};

const pattern = {
	_id: 'pattern',
	code: 'P1',
	created_at: 1_792_368_000_000,
	created_by: 'user',
	destination: 'Destination',
	headsign: 'Destination',
	line_id: 'line',
	origin: 'Origin',
	route_id: 'route',
	updated_at: 1_792_368_000_000,
};

for (const [name, schema] of Object.entries({ editor: ManualRuleSchema, writable: PatternUpdateRuleSchema })) {
	test(`${name}: ordinary rules require both weekdays and periods`, () => {
		assert.equal(schema.safeParse(manual).success, true);
		for (const invalid of [{ weekdays: [] }, { weekdays: undefined }, { year_period_ids: [] }]) {
			const result = schema.safeParse({ ...manual, ...invalid });
			assert.equal(result.success, false);
			if (!result.success) assert.equal(result.error.issues[0].path[0], Object.keys(invalid)[0]);
		}
	});

	test(`${name}: event-linked rules allow optional weekday and period narrowing`, () => {
		for (const narrowing of [{ weekdays: [], year_period_ids: [] }, { weekdays: undefined, year_period_ids: [] }, { weekdays: [1], year_period_ids: ['school'] }]) {
			assert.equal(schema.safeParse({ ...manual, ...narrowing, event_id: 'event' }).success, true);
		}
	});
}

test('Pattern create and update reject ordinary rules without periods', () => {
	const rules = [{ ...manual, year_period_ids: [] }];
	assert.equal(CreatePatternSchema.safeParse({ ...pattern, rules }).success, false);
	assert.equal(UpdatePatternSchema.safeParse({ rules }).success, false);
});

test('stored and writable Pattern rules exclude presentation metadata', () => {
	const rule = { ...manual, event: { id: 'event', title: 'Derived' }, name: 'Generated summary' };
	for (const schema of [PatternSchema, CreatePatternSchema, UpdatePatternSchema]) {
		const parsed = schema.parse({ ...pattern, rules: [rule] });
		assert.ok(parsed.rules);
		assert.equal('name' in parsed.rules[0], false);
		assert.equal('event' in parsed.rules[0], false);
	}
});

test('resolved Pattern responses accept Event rules that cannot be persisted on Patterns', () => {
	const derived = {
		_id: 'event:event:rule:restriction',
		all_day: true,
		dates: ['20261028'],
		event: { id: 'event', title: 'Current title' },
		kind: 'event_restriction',
		lines_mode: 'all',
	};
	const resolved = { ...pattern, rules: [manual, derived] };
	assert.equal(ResolvedPatternSchema.parse(resolved).rules.length, 2);
	assert.equal(PatternSchema.safeParse(resolved).success, false);
	assert.equal(CreatePatternSchema.safeParse(resolved).success, false);
	assert.equal(UpdatePatternSchema.safeParse({ rules: resolved.rules }).success, false);
});
