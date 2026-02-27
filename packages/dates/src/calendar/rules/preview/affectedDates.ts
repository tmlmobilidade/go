/* * */

import { calendarKey, CalendarKey, calendarWeekday, datesFromCalendarKey, keyToYYYYMMDD } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';
import { Event, ManualRule, OperationalDate, Period } from '@tmlmobilidade/types';

/**
 * Context for computing which dates a manual rule affects within a calendar range.
 */
interface CalendarContext {
	/** End date of the calendar range */
	endDate: Date
	/** Optional events list for eventId matching */
	events?: Event[]
	/** Available periods for matching rule criteria */
	periods: Period[]
	/** Start date of the calendar range */
	startDate: Date
}

/**
 * Checks if a rule's period criteria matches a specific calendar date.
 * Verifies that at least one of the rule's period IDs is active on this date.
 */
function isInPeriod(rule: ManualRule, key: CalendarKey, ctx: CalendarContext): boolean {
	if (!rule.periodIds?.length) return false;

	const op = keyToYYYYMMDD(key) as OperationalDate;

	return ctx.periods.some(
		p => rule.periodIds?.includes(p._id) && p.dates?.includes(op),
	);
}

/**
 * Determines if a manual rule applies to a specific calendar date.
 * Checks both period membership and weekday matching.
 */
function ruleAppliesToCivilKey(rule: ManualRule, key: CalendarKey, ctx: CalendarContext): boolean {
	const weekday = calendarWeekday(key);

	// 1) Period required
	if (!isInPeriod(rule, key, ctx)) return false;

	// 2) Weekdays required
	if (!rule.weekdays?.length) return false;
	if (!rule.weekdays.includes(weekday)) return false;

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

	if (rule.eventId) {
		const event = ctx.events?.find(e => e._id === rule.eventId);
		if (!event?.dates?.length) return { count: 0, dates: [] };

		for (const opDate of event.dates) {
			const key = calendarKey(Dates.fromOperationalDate(opDate, 'Europe/Lisbon'));
			if (key >= from && key <= to) {
				affected.push(key);
			}
		}

		return { count: affected.length, dates: affected };
	}

	let current = datesFromCalendarKey(from);
	const end = datesFromCalendarKey(to);

	while (current.unix_timestamp <= end.unix_timestamp) {
		const key = calendarKey(current);

		if (ruleAppliesToCivilKey(rule, key, ctx)) {
			affected.push(key);
		}

		current = current.plus({ days: 1 });
	}

	return { count: affected.length, dates: affected };
}
