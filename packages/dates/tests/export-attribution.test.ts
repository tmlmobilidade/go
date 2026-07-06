import type { GtfsIncludeContribution } from '../src/calendar/rules/export-attribution/types.js';
import type { Event, EventReplacementRule, HHMM, Holiday, ManualRule, OperationalDate, ScheduleRule, UnixTimestamp, YearPeriod } from '@tmlmobilidade/types';

import { hhmm } from '@tmlmobilidade/types';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { computeActiveRules } from '../src/calendar/rules/calculation/index.js';
import {
	buildCanonicalRuleDates,
	collectGtfsIncludeContributionsForDate,
	compareGeneralManualOwnershipPriority,
} from '../src/calendar/rules/export-attribution/index.js';
import { isForcedRetargetDay, resolveEffectiveReplacement } from '../src/calendar/rules/export-attribution/replacement.js';

const d = (value: string) => value as OperationalDate;
const t = (value: string) => hhmm(value) as HHMM;

const documentFields = {
	created_at: 1_700_000_000_000 as UnixTimestamp,
	created_by: null,
	is_locked: false,
	updated_at: 1_700_000_000_000 as UnixTimestamp,
};

function testEvent(overrides: Partial<Event> & Pick<Event, '_id' | 'code' | 'dates' | 'title'>): Event {
	return {
		...documentFields,
		agency_ids: ['test-agency'],
		associated_patterns: [],
		description: '',
		rules: [],
		...overrides,
	};
}

function testYearPeriod(overrides: Partial<YearPeriod> & Pick<YearPeriod, '_id' | 'name'>): YearPeriod {
	return {
		...documentFields,
		agency_ids: [],
		...overrides,
	};
}

function testEventReplacement(
	overrides: Partial<EventReplacementRule> & Pick<EventReplacementRule, '_id' | 'dates' | 'event' | 'weekdays' | 'year_period_ids'>,
): EventReplacementRule {
	return {
		kind: 'event_replacement',
		lines_mode: 'all',
		...overrides,
	};
}

const schoolPeriod = testYearPeriod({
	_id: 'school',
	dates: [d('20260201'), d('20260210'), d('20260217'), d('20260221'), d('20260228')],
	name: 'School holiday',
});

const periods = [schoolPeriod];
const holidays: never[] = [];

const weekdayRule: ManualRule = {
	_id: 'weekday',
	kind: 'manual',
	name: 'Weekday',
	operating_mode: 'include',
	timepoints: [t('10:00'), t('11:00')],
	weekdays: [1, 2, 3, 4, 5],
	year_period_ids: ['school'],
};

const saturdayRule: ManualRule = {
	_id: 'saturday',
	kind: 'manual',
	name: 'Saturday',
	operating_mode: 'include',
	timepoints: [t('11:00'), t('12:00')],
	weekdays: [6],
	year_period_ids: ['school'],
};

const allDuRule: ManualRule = {
	_id: 'all_du',
	kind: 'manual',
	name: 'All weekdays',
	operating_mode: 'include',
	timepoints: [t('10:00')],
	weekdays: [1, 2, 3, 4, 5],
	year_period_ids: ['school'],
};

const carnivalReplacement = testEventReplacement({
	_id: 'carn_replacement',
	dates: [d('20260217'), d('20260221')],
	event: { id: 'carn_event', title: 'Carnival' },
	weekdays: [6],
	year_period_ids: ['school'],
});

const carnivalEvent = testEvent({
	_id: 'carn_event',
	code: 'DIA_CARN',
	dates: [d('20260217'), d('20260221')],
	title: 'Carnival',
});

function rules(...extra: ScheduleRule[]): ScheduleRule[] {
	return [weekdayRule, saturdayRule, allDuRule, carnivalReplacement, ...extra];
}

/** SCENARIOS P5 — operating contribution timepoints match `computeActiveRules`. */
function assertOperatingMatchesComputeActiveRules(
	date: OperationalDate,
	allRules: ScheduleRule[],
	contributions: GtfsIncludeContribution[],
	options?: { events?: Event[], holidays?: Holiday[], periods?: YearPeriod[] },
) {
	const active = computeActiveRules(
		date,
		allRules,
		options?.periods ?? periods,
		options?.holidays ?? holidays,
		options,
	);
	const contributionOperating = contributions
		.filter(c => c.kind === 'operating')
		.map(c => c.timepoint)
		.sort();

	assert.deepEqual(contributionOperating, [...active.timepoints].sort());
}

describe('resolveEffectiveReplacement', () => {
	it('keeps target weekdays when same_weekday is false', () => {
		const effective = resolveEffectiveReplacement(d('20260217'), carnivalReplacement, holidays);
		assert.deepEqual(effective.weekdays, [6]);
	});

	it('uses calendar weekday when same_weekday is true', () => {
		const sameWeekdayReplacement: EventReplacementRule = {
			...carnivalReplacement,
			same_weekday: true,
		};
		const effective = resolveEffectiveReplacement(d('20260217'), sameWeekdayReplacement, holidays);
		assert.deepEqual(effective.weekdays, [2]);
	});
});

describe('isForcedRetargetDay', () => {
	it('is true for Tuesday on a Saturday replacement', () => {
		const effective = resolveEffectiveReplacement(d('20260217'), carnivalReplacement, holidays);
		assert.equal(isForcedRetargetDay(d('20260217'), effective, holidays), true);
	});

	it('is false for Saturday on a Saturday replacement', () => {
		const effective = resolveEffectiveReplacement(d('20260221'), carnivalReplacement, holidays);
		assert.equal(isForcedRetargetDay(d('20260221'), effective, holidays), false);
	});
});

describe('collectGtfsIncludeContributionsForDate', () => {
	it('FR-01: emits base_off for calendar-only timepoints not in replacement operating set', () => {
		const earlyWeekday: ManualRule = {
			_id: 'early_weekday',
			kind: 'manual',
			name: 'Early weekday',
			operating_mode: 'include',
			timepoints: [t('06:40')],
			weekdays: [1, 2, 3, 4, 5],
			year_period_ids: ['school'],
		};

		const saturdayRuleLocal: ManualRule = {
			...saturdayRule,
			timepoints: [t('06:45'), t('11:00'), t('12:00')],
		};

		const date = d('20260217');
		const contributions = collectGtfsIncludeContributionsForDate(
			date,
			[earlyWeekday, saturdayRuleLocal, carnivalReplacement],
			periods,
			holidays,
			{ events: [carnivalEvent] },
		);

		assert.ok(contributions.some(c => c.kind === 'base_off' && c.rule._id === 'early_weekday' && c.excludeRule?._id === 'carn_replacement' && c.timepoint === '06:40'));
		assert.ok(contributions.some(c => c.kind === 'operating' && c.rule._id === 'carn_replacement' && c.timepoint === '06:45'));
		assert.equal(contributions.filter(c => c.kind === 'operating' && c.timepoint === '06:40').length, 0);
		assertOperatingMatchesComputeActiveRules(
			date,
			[earlyWeekday, saturdayRuleLocal, carnivalReplacement],
			contributions,
			{ events: [carnivalEvent] },
		);
	});

	it('FR-03: shared timepoint gets replacement operating and base_off, not plain base operating', () => {
		const date = d('20260217');
		const contributions = collectGtfsIncludeContributionsForDate(date, rules(), periods, holidays, {
			events: [carnivalEvent],
		});

		const operating = contributions.filter(c => c.kind === 'operating');
		const baseOff = contributions.filter(c => c.kind === 'base_off');

		assert.equal(operating.length, 2);
		assert.ok(operating.some(c => c.rule._id === 'carn_replacement' && c.timepoint === '11:00'));
		assert.ok(operating.some(c => c.rule._id === 'carn_replacement' && c.timepoint === '12:00'));
		assert.equal(operating.some(c => c.rule._id === 'weekday'), false);
		assert.equal(baseOff.length, 2);
		assert.ok(baseOff.some(
			c => c.rule._id === 'weekday' && c.excludeRule?._id === 'carn_replacement' && c.timepoint === '10:00',
		));
		assert.ok(baseOff.some(
			c => c.rule._id === 'weekday' && c.excludeRule?._id === 'carn_replacement' && c.timepoint === '11:00',
		));

		assertOperatingMatchesComputeActiveRules(date, rules(), contributions, { events: [carnivalEvent] });
	});

	it('FR-04: does not use replacement token when calendar-day manual already covers all operating timepoints', () => {
		const weekdayPlus: ManualRule = {
			...weekdayRule,
			_id: 'weekday_plus',
			timepoints: [t('11:00'), t('12:00')],
		};
		const date = d('20260217');

		const contributions = collectGtfsIncludeContributionsForDate(
			date,
			[saturdayRule, weekdayPlus, carnivalReplacement],
			periods,
			holidays,
			{ events: [carnivalEvent] },
		);

		const operating = contributions.filter(c => c.kind === 'operating');
		assert.equal(operating.length, 2);
		assert.ok(operating.every(c => c.rule._id === 'weekday_plus'));
		assert.equal(operating.some(c => c.rule._id === 'carn_replacement'), false);
		assertOperatingMatchesComputeActiveRules(
			date,
			[saturdayRule, weekdayPlus, carnivalReplacement],
			contributions,
			{ events: [carnivalEvent] },
		);
	});

	it('FR-05: uses manual rules for operating on natural Saturday during Carnival', () => {
		const date = d('20260221');
		const contributions = collectGtfsIncludeContributionsForDate(date, rules(), periods, holidays, {
			events: [carnivalEvent],
		});

		assert.ok(contributions.some(c => c.kind === 'operating' && c.rule._id === 'saturday'));
		assert.equal(contributions.some(c => c.kind === 'operating' && c.rule._id === 'carn_replacement'), false);
		assertOperatingMatchesComputeActiveRules(date, rules(), contributions, { events: [carnivalEvent] });
	});

	it('SW-01: same_weekday replacement emits manual tokens only, not replacement row', () => {
		const sameWeekdayReplacement = testEventReplacement({
			...carnivalReplacement,
			same_weekday: true,
		});
		const date = d('20260217');

		const contributions = collectGtfsIncludeContributionsForDate(
			date,
			[weekdayRule, sameWeekdayReplacement],
			periods,
			holidays,
			{ events: [carnivalEvent] },
		);

		assert.equal(contributions.some(c => c.kind === 'operating' && c.rule._id === 'carn_replacement'), false);
		assert.ok(contributions.some(c => c.kind === 'operating' && c.rule._id === 'weekday'));
		assertOperatingMatchesComputeActiveRules(
			date,
			[weekdayRule, sameWeekdayReplacement],
			contributions,
			{ events: [carnivalEvent] },
		);
	});

	it('ND-03 on SW-01: same_weekday replacement dedupes overlapping general manuals — broader rule owns shared timepoint (ALL_DU + ALL_DU-SAB)', () => {
		const allDu: ManualRule = {
			_id: 'all_du',
			kind: 'manual',
			name: 'All weekdays',
			operating_mode: 'include',
			timepoints: [t('10:00'), t('11:00'), t('21:00')],
			weekdays: [1, 2, 3, 4, 5],
			year_period_ids: ['school'],
		};

		const allDuSab: ManualRule = {
			_id: 'all_du_sab',
			kind: 'manual',
			name: 'Weekday + Saturday extra',
			operating_mode: 'include',
			timepoints: [t('21:00')],
			weekdays: [1, 2, 3, 4, 5, 6],
			year_period_ids: ['school'],
		};

		const carnivalExceptEvent = testEvent({
			_id: 'carn_except_event',
			code: 'FER_CARN_EXC',
			dates: [d('20260216'), d('20260218')],
			title: 'Carnival except day',
		});

		const sameWeekdayReplacement = testEventReplacement({
			_id: 'carn_except_replacement',
			dates: [d('20260216'), d('20260218')],
			event: { id: 'carn_except_event', title: 'Carnival except day' },
			same_weekday: true,
			weekdays: [6],
			year_period_ids: ['school'],
		});

		const periodWithExceptDays = testYearPeriod({
			...schoolPeriod,
			dates: [...schoolPeriod.dates, d('20260216'), d('20260218')],
		});

		const date = d('20260216');
		const testRules = [allDu, allDuSab, sameWeekdayReplacement];
		const contributions = collectGtfsIncludeContributionsForDate(
			date,
			testRules,
			[periodWithExceptDays],
			holidays,
			{ events: [carnivalExceptEvent] },
		);

		// One owner per shared timepoint (P1). 21:00 lives in both rules, but ALL_DU-SAB
		// (Mon–Sat) strictly contains ALL_DU (Mon–Fri), so the broader rule owns 21:00 and its
		// date set stays whole (Mon–Sat under one token, not fragmented Mon–Fri + Sat).
		assert.equal(
			contributions.filter(c => c.kind === 'operating' && c.timepoint === '21:00').length,
			1,
		);
		assert.ok(contributions.some(
			c => c.kind === 'operating' && c.rule._id === 'all_du_sab' && c.timepoint === '21:00',
		));
		assert.equal(
			contributions.some(c => c.kind === 'operating' && c.rule._id === 'all_du' && c.timepoint === '21:00'),
			false,
		);
		// ALL_DU still owns the timepoints unique to it.
		assert.ok(contributions.some(
			c => c.kind === 'operating' && c.rule._id === 'all_du' && c.timepoint === '10:00',
		));
		assertOperatingMatchesComputeActiveRules(
			date,
			testRules,
			contributions,
			{ events: [carnivalExceptEvent], periods: [periodWithExceptDays] },
		);
	});

	it('applies event_id displacement on normal days', () => {
		const eventSpecific: ManualRule = {
			_id: 'event_manual',
			event_id: 'other_event',
			kind: 'manual',
			name: 'Event manual',
			operating_mode: 'include',
			timepoints: [t('09:00')],
			weekdays: [2],
			year_period_ids: ['school'],
		};

		const general: ManualRule = {
			_id: 'general',
			kind: 'manual',
			name: 'General',
			operating_mode: 'include',
			timepoints: [t('09:00'), t('10:00')],
			weekdays: [2],
			year_period_ids: ['school'],
		};

		const otherEvent = testEvent({
			_id: 'other_event',
			code: 'OTHER',
			dates: [d('20260210')],
			title: 'Other',
		});

		const date = d('20260210');
		const contributions = collectGtfsIncludeContributionsForDate(
			date,
			[eventSpecific, general],
			periods,
			holidays,
			{ events: [otherEvent] },
		);

		assert.ok(contributions.some(c => c.kind === 'operating' && c.rule._id === 'event_manual' && c.timepoint === '09:00'));
		assert.ok(contributions.some(c => c.kind === 'base_off' && c.rule._id === 'general' && c.excludeRule?._id === 'event_manual' && c.timepoint === '09:00'));
		assert.ok(contributions.some(c => c.kind === 'operating' && c.rule._id === 'general' && c.timepoint === '10:00'));
	});

	it('ND-03: overlapping general manuals — primary schedule owns shared timepoint, no base_off', () => {
		const escDu: ManualRule = {
			_id: 'esc_du',
			kind: 'manual',
			name: 'School weekdays',
			operating_mode: 'include',
			timepoints: [
				t('20:00'),
				t('20:30'),
				t('21:00'),
				t('10:00'),
				t('11:00'),
			],
			weekdays: [1, 2, 3, 4, 5],
			year_period_ids: ['school'],
		};

		const escVerDu: ManualRule = {
			_id: 'esc_ver_du',
			kind: 'manual',
			name: 'Two periods weekdays',
			operating_mode: 'include',
			timepoints: [t('15:55'), t('20:30')],
			weekdays: [1, 2, 3, 4, 5],
			year_period_ids: ['school'],
		};

		assert.ok(compareGeneralManualOwnershipPriority(escDu, escVerDu) < 0);

		const date = d('20260210');
		const contributions = collectGtfsIncludeContributionsForDate(
			date,
			[escDu, escVerDu],
			periods,
			holidays,
		);

		assert.ok(contributions.some(
			c => c.kind === 'operating' && c.rule._id === 'esc_du' && c.timepoint === '20:30',
		));
		assert.ok(contributions.some(
			c => c.kind === 'operating' && c.rule._id === 'esc_ver_du' && c.timepoint === '15:55',
		));
		assert.equal(
			contributions.some(c => c.kind === 'base_off' && c.timepoint === '20:30'),
			false,
		);
		assert.equal(
			contributions.filter(c => c.kind === 'operating' && c.timepoint === '20:30').length,
			1,
		);

		assertOperatingMatchesComputeActiveRules(date, [escDu, escVerDu], contributions);
	});

	it('ND-05: event manual operating + general base_off on shared timepoint (Santo António)', () => {
		const santoEvent = testEvent({
			_id: 'santo_event',
			code: 'SANTOS',
			dates: [d('20260613')],
			title: 'Santo António',
		});

		const weekendGeneral: ManualRule = {
			_id: 'all_sab_dom',
			kind: 'manual',
			name: 'Weekend',
			operating_mode: 'include',
			timepoints: [t('06:05'), t('08:05')],
			weekdays: [6, 7],
			year_period_ids: ['school'],
		};

		const santoManual: ManualRule = {
			_id: 'santo_manual',
			event_id: 'santo_event',
			kind: 'manual',
			name: 'Santo António',
			operating_mode: 'include',
			timepoints: [t('06:05')],
			weekdays: [6, 7],
			year_period_ids: ['school'],
		};

		const junePeriod = testYearPeriod({
			_id: 'school',
			dates: [d('20260613')],
			name: 'School',
		});

		const date = d('20260613');
		const contributions = collectGtfsIncludeContributionsForDate(
			date,
			[weekendGeneral, santoManual],
			[junePeriod],
			holidays,
			{ events: [santoEvent] },
		);

		assert.ok(contributions.some(
			c => c.kind === 'operating' && c.rule._id === 'santo_manual' && c.timepoint === '06:05',
		));
		assert.ok(contributions.some(c => c.kind === 'base_off' && c.rule._id === 'all_sab_dom' && c.excludeRule?._id === 'santo_manual' && c.timepoint === '06:05'));
		assert.ok(contributions.some(
			c => c.kind === 'operating' && c.rule._id === 'all_sab_dom' && c.timepoint === '08:05',
		));

		assertOperatingMatchesComputeActiveRules(
			date,
			[weekendGeneral, santoManual],
			contributions,
			{ events: [santoEvent], periods: [junePeriod] },
		);
	});

	it('ER-01: event manual exclude on holiday emits base_off, not plain calendar operating (2303-style)', () => {
		const jan1Holiday: Holiday = {
			...documentFields,
			_id: 'ny_day',
			agency_ids: [],
			dates: [d('20260101')],
			title: 'Ano Novo',
		};

		const jan1Event = testEvent({
			_id: 'jan_event',
			code: '01_JAN_A2',
			dates: [d('20260101')],
			title: '01 de janeiro',
		});

		const domInclude: ManualRule = {
			_id: 'dom_include',
			kind: 'manual',
			name: 'Dom',
			operating_mode: 'include',
			timepoints: [t('07:20'), t('07:50')],
			weekdays: [7],
			year_period_ids: ['school'],
		};

		const jan1Exclude: ManualRule = {
			_id: 'jan_exclude',
			event_id: 'jan_event',
			kind: 'manual',
			operating_mode: 'exclude',
			timepoints: [t('07:20'), t('07:50')],
			weekdays: [],
			year_period_ids: [],
		};

		const janPeriod = testYearPeriod({
			_id: 'school',
			dates: [d('20260101'), d('20260104')],
			name: 'School',
		});

		const jan1Contributions = collectGtfsIncludeContributionsForDate(
			d('20260101'),
			[domInclude, jan1Exclude],
			[janPeriod],
			[jan1Holiday],
			{ events: [jan1Event] },
		);

		assert.equal(jan1Contributions.filter(c => c.kind === 'operating').length, 0);
		assert.ok(jan1Contributions.every(
			c => c.kind === 'base_off'
				&& c.rule._id === 'dom_include'
				&& c.excludeRule?._id === 'jan_exclude',
		));

		const sundayContributions = collectGtfsIncludeContributionsForDate(
			d('20260104'),
			[domInclude, jan1Exclude],
			[janPeriod],
			[jan1Holiday],
			{ events: [jan1Event] },
		);

		assert.equal(sundayContributions.filter(c => c.kind === 'base_off').length, 0);
		assert.ok(sundayContributions.every(c => c.kind === 'operating' && c.rule._id === 'dom_include'));

		assertOperatingMatchesComputeActiveRules(
			d('20260101'),
			[domInclude, jan1Exclude],
			jan1Contributions,
			{ events: [jan1Event], holidays: [jan1Holiday], periods: [janPeriod] },
		);
		assertOperatingMatchesComputeActiveRules(
			d('20260104'),
			[domInclude, jan1Exclude],
			sundayContributions,
			{ events: [jan1Event], holidays: [jan1Holiday], periods: [janPeriod] },
		);
	});

	it('ER-02: event exclude manual zeroes all weekday timepoints on event date (A2_24 dezembro)', () => {
		const dec24Event = testEvent({
			_id: 'dec24_event',
			code: 'A2_24',
			dates: [d('20261224')],
			title: '24 dezembro',
		});

		const weekdayInclude: ManualRule = {
			_id: 'all_du',
			kind: 'manual',
			name: 'Weekday',
			operating_mode: 'include',
			timepoints: [t('06:10'), t('06:30'), t('10:15')],
			weekdays: [1, 2, 3, 4, 5],
			year_period_ids: ['school'],
		};

		const dec24Exclude: ManualRule = {
			_id: 'dec24_exclude',
			event_id: 'dec24_event',
			kind: 'manual',
			name: '24 dezembro exclude',
			operating_mode: 'exclude',
			timepoints: [t('06:10'), t('06:30'), t('10:15')],
			weekdays: [],
			year_period_ids: [],
		};

		const decPeriod = testYearPeriod({
			_id: 'school',
			dates: [d('20261224'), d('20261223')],
			name: 'School',
		});

		const date = d('20261224');
		const active = computeActiveRules(
			date,
			[weekdayInclude, dec24Exclude],
			[decPeriod],
			holidays,
			{ events: [dec24Event] },
		);

		assert.equal(active.timepoints.length, 0);

		const contributions = collectGtfsIncludeContributionsForDate(
			date,
			[weekdayInclude, dec24Exclude],
			[decPeriod],
			holidays,
			{ events: [dec24Event] },
		);

		assert.equal(contributions.filter(c => c.kind === 'operating').length, 0);
		assert.equal(contributions.filter(c => c.kind === 'base_off').length, 3);
		assert.ok(contributions.every(
			c => c.kind === 'base_off'
				&& c.rule._id === 'all_du'
				&& c.excludeRule?._id === 'dec24_exclude',
		));

		assertOperatingMatchesComputeActiveRules(
			date,
			[weekdayInclude, dec24Exclude],
			contributions,
			{ events: [dec24Event], periods: [decPeriod] },
		);
	});
});

describe('buildCanonicalRuleDates', () => {
	const exportDates = [
		d('20260210'),
		d('20260217'),
		d('20260218'),
		d('20260221'),
	];

	it('includes Carnival Tuesday in FER weekday canonical set', () => {
		const ferDu: ManualRule = {
			_id: 'fer_du',
			kind: 'manual',
			name: 'FER weekdays',
			operating_mode: 'include',
			timepoints: [t('09:35')],
			weekdays: [1, 2, 3, 4, 5],
			year_period_ids: ['school'],
		};

		const dates = buildCanonicalRuleDates(ferDu, exportDates, { events: [], holidays, periods });
		assert.ok(dates.has(d('20260217')));
		assert.ok(dates.has(d('20260210')));
		assert.ok(!dates.has(d('20260221')));
	});

	it('maps replacement rules to explicit event dates only', () => {
		const dates = buildCanonicalRuleDates(carnivalReplacement, exportDates, {
			events: [carnivalEvent],
			holidays,
			periods,
		});
		assert.deepEqual([...dates].sort(), [d('20260217'), d('20260221')]);
	});
});
