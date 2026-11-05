import { EventReplacementSchema, ManualRuleBaseSchema } from '@tmlmobilidade/go-types-offer';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createOfferTranslator } from '../src/i18n/create-translator.js';
import { manualRuleMatchesContext } from '../src/rules/calculation/matchers.js';
import { type CanonicalDateCache, resolveCanonicalDatesForRule } from '../src/rules/export-attribution/trip-row-dates.js';
import { buildRuleSummaryGtfs } from '../src/rules/formatting/gtfs-rule-name.js';

/* * */

function replacement(date: string) {
	return EventReplacementSchema.parse({
		dates: [date],
		event: { id: 'event', title: 'Event' },
		kind: 'event_replacement',
		lines_mode: 'all',
		weekdays: [1],
		year_period_ids: ['school'],
	});
}

test('unnamed replacement rules do not share a canonical date cache entry', () => {
	const first = replacement('20261028');
	const second = replacement('20261029');
	const exportDates = [...first.dates, ...second.dates];
	const cache: CanonicalDateCache = new Map();
	const sources = { events: [], holidays: [], periods: [] };
	assert.deepEqual([...resolveCanonicalDatesForRule(first, new Set(), cache, exportDates, sources)], first.dates);
	assert.deepEqual([...resolveCanonicalDatesForRule(second, new Set(), cache, exportDates, sources)], second.dates);
	assert.equal(cache.size, 0);
});

test('GTFS summaries fall back to the parent identity when optional metadata is missing', async () => {
	const t = await createOfferTranslator('pt');
	assert.equal(buildRuleSummaryGtfs(replacement('20261028'), { locale: 'pt', t }), 'event');
});

test('an incomplete stored ordinary rule does not match a weekday context', () => {
	const rule = ManualRuleBaseSchema.parse({ _id: 'legacy', kind: 'manual', operating_mode: 'include', timepoints: [], year_period_ids: ['school'] });
	assert.equal(manualRuleMatchesContext(rule, { weekday: 1, yearPeriodId: 'school' }), false);
});
