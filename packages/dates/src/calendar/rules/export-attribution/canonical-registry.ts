import type { DayContext } from '../calculation/types.js';
import type { Event, EventReplacementRule, HHMM, Holiday, ManualRule, OperationalDate, ScheduleRule, YearPeriod } from '@tmlmobilidade/types';

import { calendarKey, calendarWeekday } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';

import { manualRuleMatchesContext } from '../calculation/matchers.js';
import { getActivePeriodId } from '../utils/date.js';

export interface CanonicalRegistryOptions {
	events?: Event[]
	holidays: Holiday[]
	periods: YearPeriod[]
}

/**
 * Date set for a rule token from definition (period × weekday × months × events),
 * not from trip-day accumulation.
 */
export function buildCanonicalRuleDates(
	rule: ScheduleRule,
	exportDates: readonly OperationalDate[],
	{ events, holidays, periods }: CanonicalRegistryOptions,
): Set<OperationalDate> {
	if (rule.kind === 'event_replacement') {
		const replacement = rule as EventReplacementRule;
		return new Set(exportDates.filter(date => replacement.dates?.includes(date)));
	}

	if (rule.kind !== 'manual' || rule.operating_mode !== 'include') {
		return new Set();
	}

	const manual = rule as ManualRule;
	const dates = new Set<OperationalDate>();

	for (const date of exportDates) {
		if (!manualRuleAppliesOnDate(manual, date, periods, holidays, events)) continue;
		dates.add(date);
	}

	return dates;
}

function manualRuleAppliesOnDate(
	rule: ManualRule,
	date: OperationalDate,
	periods: YearPeriod[],
	holidays: Holiday[],
	events?: Event[],
): boolean {
	if (rule.event_id) {
		const event = events?.find(e => e._id === rule.event_id);
		if (!event?.dates?.length || !event.dates.includes(date)) return false;
	}

	const key = calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));
	const month = Number(key.slice(5, 7));
	if (rule.months?.length && !(rule.months as number[]).includes(month)) return false;

	const ctx: DayContext = {
		weekday: calendarWeekday(key, holidays),
		yearPeriodId: getActivePeriodId(date, periods),
	};

	return manualRuleMatchesContext(rule, ctx);
}

function soleCalendarOwnerCoversOperating(
	operatingTimepoints: Iterable<HHMM>,
	calendarOperatingByTimepoint: Map<HHMM, ScheduleRule>,
): boolean {
	const sortedOperating = [...operatingTimepoints].sort();
	if (!sortedOperating.length) return false;

	const ownerIds = new Set(
		sortedOperating.map(tp => calendarOperatingByTimepoint.get(tp)?._id),
	);

	if (ownerIds.size !== 1 || ownerIds.has(undefined)) return false;

	const ownerRule = calendarOperatingByTimepoint.get(sortedOperating[0]);
	if (ownerRule?.kind !== 'manual') return false;

	const ownerTimepoints = [...(ownerRule.timepoints ?? [])].sort();
	return ownerTimepoints.join(',') === sortedOperating.join(',');
}

/**
 * On forced-retarget replacement days, emit the replacement token for operating
 * timepoints unless one calendar manual rule exactly covers the full operating set.
 */
export function shouldEmitReplacementOnForcedRetarget(
	operatingTimepoints: Iterable<HHMM>,
	calendarOperatingByTimepoint: Map<HHMM, ScheduleRule>,
): boolean {
	return !soleCalendarOwnerCoversOperating(operatingTimepoints, calendarOperatingByTimepoint);
}
