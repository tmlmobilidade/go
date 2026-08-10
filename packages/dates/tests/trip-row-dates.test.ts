import type { Event, Holiday, ManualRule, OperationalDate, ScheduleRule, YearPeriod } from '@tmlmobilidade/types';

import { hhmm } from '@tmlmobilidade/types';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
	buildCanonicalRuleDates,
	computeOffRowDates,
	splitOperationalDatesByExcludeOverlap,
} from '../src/calendar/rules/export-attribution/index.js';

const d = (value: string) => value as OperationalDate;
const t = (value: string) => hhmm(value);

const ferPeriod = {
	_id: 'fer',
	agency_ids: [] as string[],
	created_at: 1 as never,
	created_by: null,
	dates: [
		d('20260615'),
		d('20260616'),
		d('20260617'),
		d('20260618'),
		d('20260619'),
		d('20260622'),
		d('20260623'),
		d('20260624'),
		d('20260625'),
		d('20260626'),
	],
	is_locked: false,
	name: 'Férias',
	updated_at: 1 as never,
};

const escPeriod = {
	...ferPeriod,
	_id: 'esc',
	dates: [d('20260210'), d('20260211'), d('20261224')],
	name: 'Escolar',
};

const periods = [escPeriod, ferPeriod];
const holidays: Holiday[] = [];
const events: Event[] = [];

const allDu: ManualRule = {
	_id: 'all_du',
	kind: 'manual',
	name: 'All weekdays',
	operating_mode: 'include',
	timepoints: [t('07:30'), t('08:30')],
	weekdays: [1, 2, 3, 4, 5],
	year_period_ids: ['esc', 'fer'],
};

const vesEventManual: ManualRule = {
	_id: 'ves_manual',
	event_id: 'ves_event',
	kind: 'manual',
	name: 'Véspera Natal',
	operating_mode: 'include',
	timepoints: [t('07:30'), t('08:30')],
	weekdays: [1, 2, 3, 4, 5],
	year_period_ids: ['esc', 'fer'],
};

const exportDates = [
	d('20260615'),
	d('20260616'),
	d('20261224'),
	d('20261225'),
];

describe('splitOperationalDatesByExcludeOverlap', () => {
	it('ND-04 / SW-01: férias weekdays stay plain when exclude only hits Natal', () => {
		const includeDates = new Set([d('20260615'), d('20260616'), d('20261224')]);
		const excludeSchedules = [{
			dates: new Set([d('20261224')]),
			rule: vesEventManual as ScheduleRule,
		}];

		const split = splitOperationalDatesByExcludeOverlap(
			includeDates,
			allDu._id,
			excludeSchedules,
		);

		assert.deepEqual([...split.plainOperationalDates].sort(), [d('20260615'), d('20260616')]);
		assert.deepEqual([...split.offOperationalDates].sort(), [d('20261224')]);
		assert.equal(split.overlappingExcludeSchedules.length, 1);
	});

	it('returns all plain when no exclude overlap', () => {
		const includeDates = new Set([d('20260615'), d('20260616')]);
		const split = splitOperationalDatesByExcludeOverlap(includeDates, allDu._id, []);

		assert.deepEqual([...split.plainOperationalDates].sort(), [d('20260615'), d('20260616')]);
		assert.equal(split.offOperationalDates.size, 0);
	});
});

describe('computeOffRowDates', () => {
	it('OFF row keeps canonical weekdays minus event date; plain dates handled separately', () => {
		const feriasDates = new Set([d('20260615'), d('20260616')]);
		const natalDate = new Set([d('20261224')]);
		const includeDates = new Set([...feriasDates, ...natalDate]);

		const excludeSchedules = [{
			dates: natalDate,
			rule: vesEventManual as ScheduleRule,
		}];

		const split = splitOperationalDatesByExcludeOverlap(
			includeDates,
			allDu._id,
			excludeSchedules,
		);

		const cache = new Map<string, Set<OperationalDate>>();
		const offDates = computeOffRowDates(
			allDu,
			split.overlappingExcludeSchedules,
			cache,
			exportDates,
			{ events, holidays, periods: periods as YearPeriod[] },
			split.offOperationalDates,
		);

		const canonicalAllDu = buildCanonicalRuleDates(allDu, exportDates, { events, holidays, periods: periods as YearPeriod[] });

		assert.ok(split.plainOperationalDates.has(d('20260615')));
		assert.ok(offDates.has(d('20260615')), 'canonical OFF includes férias until plain row claims them');
		assert.ok(!offDates.has(d('20261224')), 'event day removed from OFF calendar');

		const plainClaimed = new Set(split.plainOperationalDates);
		const operationalOff = new Set([...offDates].filter(date => !plainClaimed.has(date)));
		assert.ok(!operationalOff.has(d('20260615')), 'after plain claiming, férias is not on OFF row');
		assert.ok([...operationalOff].every(date => canonicalAllDu.has(date)));
	});

	it('allIncludeAccumulated caps canonical expansion — event_replacement leak dates are removed', () => {
		// Simulates: base rule (ESC_DU/TKNKU) has a year-period spanning both Easter and June.
		// June dates are excluded by an explicit exclude rule (creating this OFF row).
		// Easter dates are NOT excluded by any explicit exclude — the event_replacement for Easter
		// redirects the whole pattern to a different year-period where this timepoint doesn't exist,
		// so the base rule never accumulates on Easter. Without capping, canonical(ESC_DU) includes
		// Easter, and after subtracting the June exclude those Easter dates become phantom OFF days.

		const periodWithEaster = {
			...escPeriod,
			_id: 'esc_w_easter',
			dates: [d('20260210'), d('20260211'), d('20260406'), d('20260407'), d('20260615'), d('20260616')],
		};

		const escDu: ManualRule = {
			_id: 'esc_du',
			kind: 'manual',
			name: 'ESC_DU',
			operating_mode: 'include',
			timepoints: [t('08:20')],
			weekdays: [1, 2, 3, 4, 5],
			year_period_ids: ['esc_w_easter'],
		};

		const juneDates = new Set([d('20260615'), d('20260616')]);
		// allIncludeAccumulated: dates where escDu actually accumulated for 08:20.
		// Easter (20260406, 20260407) is absent because event_replacement redirected away.
		const accumulated = new Set([d('20260210'), d('20260211'), d('20260615'), d('20260616')]);

		const juneExclude: ManualRule = {
			_id: 'june_ex',
			event_id: 'june_event',
			kind: 'manual',
			name: 'JUN_U2_SEM',
			operating_mode: 'exclude',
			timepoints: [t('08:20')],
			weekdays: [],
			year_period_ids: [],
		};

		const allDates = [d('20260210'), d('20260211'), d('20260406'), d('20260407'), d('20260615'), d('20260616')];

		const cache = new Map<string, Set<OperationalDate>>();
		const offDates = computeOffRowDates(
			escDu as ScheduleRule,
			[{ dates: juneDates, rule: juneExclude as ScheduleRule }],
			cache,
			allDates,
			{ events, holidays, periods: [periodWithEaster as YearPeriod] },
			juneDates,
			accumulated,
		);

		assert.ok(!offDates.has(d('20260406')), 'Easter Monday must not leak into the JUN_U2_SEM OFF row');
		assert.ok(!offDates.has(d('20260407')), 'Easter Tuesday must not leak into the JUN_U2_SEM OFF row');
		assert.ok(!offDates.has(d('20260615')), 'June dates removed by canonical exclude');
		assert.ok(!offDates.has(d('20260616')), 'June dates removed by canonical exclude');
		assert.ok(offDates.has(d('20260210')) || offDates.has(d('20260211')), 'normal school dates remain in canonical base');
	});
});
