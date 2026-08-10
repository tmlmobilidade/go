import { hhmm, type Event, type EventRestrictionRule, type HHMM, type OperationalDate, type Pattern } from '@tmlmobilidade/types';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getTimepointsRemovedByEventRestriction } from '../src/calendar/rules/calculation/filters.js';
import { resolvePatternRules } from '../src/calendar/rules/merging/index.js';

const d = (value: string) => value as OperationalDate;
const t = (value: string) => hhmm(value) as HHMM;

function restriction(overrides: Partial<EventRestrictionRule> & Pick<EventRestrictionRule, '_id' | 'all_day' | 'dates'>): EventRestrictionRule {
	return {
		end_time: '',
		event: { id: 'evt', title: 'Test' },
		kind: 'event_restriction',
		lines_mode: 'all',
		start_time: '',
		...overrides,
	};
}

describe('getTimepointsRemovedByEventRestriction', () => {
	const candidates = [t('08:00'), t('11:55'), t('12:25'), t('22:00'), t('04:30')];

	it('removes all candidates when all_day', () => {
		const removed = getTimepointsRemovedByEventRestriction(
			restriction({ _id: 'all', all_day: true, dates: [d('20260101')] }),
			candidates,
		);
		assert.deepEqual(removed.sort(), [...candidates].sort());
	});

	it('removes only explicit timepoints (Jan 1 style)', () => {
		const removed = getTimepointsRemovedByEventRestriction(
			restriction({
				_id: 'jan',
				all_day: false,
				dates: [d('20260101')],
				timepoints: candidates.filter(tp => tp !== t('11:55') && tp !== t('12:25')),
			}),
			candidates,
		);
		assert.deepEqual(removed.sort(), [t('08:00'), t('04:30'), t('22:00')].sort());
	});

	it('removes timepoints inside a same-day window', () => {
		const removed = getTimepointsRemovedByEventRestriction(
			restriction({
				_id: 'window',
				all_day: false,
				dates: [d('20260101')],
				end_time: t('13:00'),
				start_time: t('11:00'),
			}),
			candidates,
		);
		assert.deepEqual(removed, [t('11:55'), t('12:25')]);
	});

	it('removes timepoints inside a window that crosses midnight', () => {
		const removed = getTimepointsRemovedByEventRestriction(
			restriction({
				_id: 'night',
				all_day: false,
				dates: [d('20260101')],
				end_time: t('05:00'),
				start_time: t('22:00'),
			}),
			candidates,
		);
		assert.deepEqual(removed.sort(), [t('22:00'), t('04:30')].sort());
	});
});

describe('resolvePatternRules', () => {
	it('copies explicit timepoints from event restriction rules', () => {
		const event: Event = {
			_id: '01_JAN',
			agency_ids: ['42'],
			associated_patterns: [],
			code: '01_JAN',
			created_at: 0,
			created_by: null,
			dates: [d('20260101')],
			description: '',
			is_locked: false,
			rules: [{
				_id: 'restrict_weekend',
				all_day: false,
				dates: [d('20260101')],
				end_time: '',
				kind: 'event_restriction',
				lines_mode: 'all',
				start_time: '',
				timepoints: [t('06:00'), t('07:00')],
			}],
			title: 'Jan 1',
			updated_at: 0,
		};

		const pattern = {
			_id: '2523_0_1',
			line_id: 'line-1',
			rules: [],
		} as Pattern;

		const merged = resolvePatternRules(pattern, [event]);
		const derived = merged.find(r => r.kind === 'event_restriction');

		assert.ok(derived && derived.kind === 'event_restriction');
		assert.deepEqual(derived.timepoints, [t('06:00'), t('07:00')]);
	});
});
