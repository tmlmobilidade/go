import { YearPeriodSchema } from '@tmlmobilidade/go-types-offer';
import { toCalendarDate } from '@tmlmobilidade/go-types-shared';
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { createPeriodDatesDraft, reducePeriodDatesDraft } from '../src/components/year-periods/shared/periods-date-draft.js';
import { getPeriodsDetailReviewRequest, getPeriodsDetailUpdate } from '../src/components/year-periods/shared/periods-detail-update.js';

/* * */

const first = toCalendarDate('2027-01-01');
const second = toCalendarDate('2027-01-02');
const third = toCalendarDate('2027-01-03');
const initialDates = new Set([first]);
const agencies = ['A', 'B', 'C', 'D'];
const period = YearPeriodSchema.parse({ _id: 'school', agency_ids: agencies, created_at: 1792368000000, created_by: 'actor', dates: ['20270101'], name: 'School', updated_at: 1792368000000 });

/* * */

test('starting a range does not change dates, and cancelling clears the start and action', () => {
	const selecting = reducePeriodDatesDraft(createPeriodDatesDraft(), { initialDates, previewDates: initialDates, range: { end: null, start: first }, type: 'select' });
	assert.equal(selecting.selectionAction, 'remove');
	assert.equal(selecting.added.size, 0);
	assert.equal(selecting.removed.size, 0);
	const cancelled = reducePeriodDatesDraft(selecting, { type: 'cancel' });
	assert.equal(cancelled.selectedRange, null);
	assert.equal(cancelled.selectionAction, null);
	assert.deepEqual(cancelled.added, selecting.added);
	assert.deepEqual(cancelled.removed, selecting.removed);
});

test('cancelling an unfinished range preserves earlier completed changes', () => {
	const completed = reducePeriodDatesDraft(createPeriodDatesDraft(), { initialDates, previewDates: initialDates, range: { end: third, start: second }, type: 'select' });
	assert.deepEqual([...completed.added], [second, third]);
	const selecting = reducePeriodDatesDraft(completed, { initialDates, previewDates: new Set([first, second, third]), range: { end: null, start: first }, type: 'select' });
	const cancelled = reducePeriodDatesDraft(selecting, { type: 'cancel' });
	assert.deepEqual([...cancelled.added], [second, third]);
	assert.equal(cancelled.removed.size, 0);
	assert.equal(cancelled.selectedRange, null);
	const restarted = reducePeriodDatesDraft(cancelled, { initialDates, previewDates: new Set([first, second, third]), range: { end: null, start: third }, type: 'select' });
	assert.equal(restarted.selectionAction, 'remove');
	assert.equal(restarted.selectedRange?.start, third);
	assert.deepEqual(reducePeriodDatesDraft(restarted, { type: 'reset' }), createPeriodDatesDraft());
});

test('combined save sends date deltas and writable settings without sending stale full dates or lock changes', () => {
	const request = getPeriodsDetailUpdate({ ...period, is_locked: true, name: 'Renamed' }, [second], [first]);
	assert.deepEqual(request.add_dates, ['20270102']);
	assert.deepEqual(request.remove_dates, ['20270101']);
	assert.deepEqual(request.period, { agency_ids: agencies, name: 'Renamed' });
});

test('review checks all operators for additions, and all remaining dates when changing operators', () => {
	const additions = getPeriodsDetailReviewRequest(period, agencies, [second], [first, second]);
	assert.deepEqual(additions, { agency_ids: agencies, dates: ['20270102'], year_period_id: 'school' });
	const moved = getPeriodsDetailReviewRequest(period, ['Z'], [third], [second, third]);
	assert.deepEqual(moved, { agency_ids: ['Z'], dates: ['20270102', '20270103'], year_period_id: 'school' });
	assert.equal(getPeriodsDetailReviewRequest(period, agencies, [], []), null);
	assert.equal(getPeriodsDetailReviewRequest(period, ['Z'], [], []), null);
});
