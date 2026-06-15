/* * */

import { calendarKey, CalendarKey, calendarWeekday, datesFromCalendarKey, keyToYYYYMMDD } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';
import { Event, Holiday, ManualRule, OperationalDate, YearPeriod } from '@tmlmobilidade/types';

/**
 * Context for computing which dates a manual rule affects within a calendar range.
 */
interface CalendarContext {
	/** End date of the calendar range */
	endDate: Date
	/** Optional events list for event_id matching */
	events?: Event[]
	/** Available holidays for accurate weekday calculations */
	holidays: Holiday[]
	/** Available periods for matching rule criteria */
	periods: YearPeriod[]
	/** Start date of the calendar range */
	startDate: Date
}

/**
 * Checks if a rule's period criteria matches a specific calendar date.
 * Verifies that at least one of the rule's period IDs is active on this date.
 */
function buildActivePeriodDateSet(rule: ManualRule, ctx: CalendarContext): Set<OperationalDate> {
	const activePeriodDates = new Set<OperationalDate>();

	if (!rule.year_period_ids?.length) return activePeriodDates;

	for (const period of ctx.periods) {
		if (!rule.year_period_ids.includes(period._id)) continue;

		for (const date of period.dates ?? []) {
			activePeriodDates.add(date as OperationalDate);
		}
	}

	return activePeriodDates;
}

function isInPeriod(rule: ManualRule, key: CalendarKey, activePeriodDates: Set<OperationalDate>): boolean {
	if (!rule.year_period_ids?.length) return false;

	const op = keyToYYYYMMDD(key) as OperationalDate;

	return activePeriodDates.has(op);
}

/**
 * Determines if a manual rule applies to a specific calendar date.
 * Checks both period membership and weekday matching.
 */
function ruleAppliesToCivilKey(rule: ManualRule, key: CalendarKey, ctx: CalendarContext, activePeriodDates: Set<OperationalDate>): boolean {
	const weekday = calendarWeekday(key, ctx.holidays);

	// 1) YearPeriod required
	if (!isInPeriod(rule, key, activePeriodDates)) return false;

	// 2) Weekdays required
	if (!rule.weekdays?.length) return false;
	if (!rule.weekdays.includes(weekday)) return false;

	// 3) Months filter (optional)
	if (rule.months?.length) {
		const month = Number(key.slice(5, 7));
		if (!(rule.months as number[]).includes(month)) return false;
	}

	return true;
}

// USED IN RuleCreateEditView

/**
 * Computes which dates within a calendar range are affected by a manual rule.
 *
 * Used in the UI to preview which dates will be impacted when creating or editing
 * a manual rule. Checks each date in the range to see if it matches the rule's
 * weekday and period criteria.
 *
 * @param rule - The manual rule to analyze
 * @param ctx - Calendar context with date range and periods
 * @returns Object with count and array of affected CalendarKeys
 */
export function getManualRuleAffectedDates(rule: ManualRule, ctx: CalendarContext) {
	const affected: CalendarKey[] = [];

	const startKey = calendarKey(Dates.fromJSDate(ctx.startDate));
	const endKey = calendarKey(Dates.fromJSDate(ctx.endDate));

	// normalize direction (ensure from <= to)
	const from = startKey < endKey ? startKey : endKey;
	const to = startKey < endKey ? endKey : startKey;
	const activePeriodDates = buildActivePeriodDateSet(rule, ctx);

	if (rule.event_id) {
		const event = ctx.events?.find(e => e._id === rule.event_id);
		if (!event?.dates?.length) return { count: 0, dates: [] };

		for (const opDate of event.dates) {
			const key = calendarKey(Dates.fromOperationalDate(opDate, 'Europe/Lisbon'));
			if (key >= from && key <= to) {
				// If weekdays are specified, narrow event dates to matching weekdays only
				if (rule.weekdays?.length) {
					const weekday = calendarWeekday(key, ctx.holidays);
					if (!rule.weekdays.includes(weekday)) continue;
				}
				// If year periods are specified, narrow event dates to matching periods only
				if (rule.year_period_ids?.length) {
					if (!isInPeriod(rule, key, activePeriodDates)) continue;
				}
				// If months are specified, narrow event dates to matching months only
				if (rule.months?.length) {
					const month = Number(key.slice(5, 7));
					if (!(rule.months as number[]).includes(month)) continue;
				}
				affected.push(key);
			}
		}

		return { count: affected.length, dates: affected };
	}

	let current = datesFromCalendarKey(from);
	const end = datesFromCalendarKey(to);

	while (current.unix_timestamp <= end.unix_timestamp) {
		const key = calendarKey(current);

		if (ruleAppliesToCivilKey(rule, key, ctx, activePeriodDates)) {
			affected.push(key);
		}

		current = current.plus({ days: 1 });
	}

	return { count: affected.length, dates: affected };
}
