import type { OperationalDate, Period, ScheduleRule, WEEKDAYS } from '@tmlmobilidade/types';

import { calendarKey, CalendarKey, calendarWeekday, Dates, datesFromCalendarKey, keyToYYYYMMDD } from '@tmlmobilidade/dates';

interface CalendarContext {
	endDate: Date
	events: Set<string> // yyyy-mm-dd
	holidays: Set<string> // yyyy-mm-dd
	periods: Period[]
	startDate: Date
}

function isInPeriod(rule: ScheduleRule, key: CalendarKey, ctx: CalendarContext): boolean {
	if (!rule.periodIds?.length) return false;

	// Periods are stored as OperationalDate (yyyyMMdd)
	const op = keyToYYYYMMDD(key) as OperationalDate;

	return ctx.periods.some(p =>
		rule.periodIds?.includes(p._id) && p.dates?.includes(op),
	);
}

function ruleAppliesToCivilKey(rule: ScheduleRule, key: CalendarKey, ctx: CalendarContext): boolean {
	const weekday = calendarWeekday(key);

	// 1) Period required
	if (!isInPeriod(rule, key, ctx)) return false;

	// 2) Holidays exclusion (your rule says "exceto feriados")
	if (ctx.holidays.has(key)) return false;

	// 3) Weekdays required
	if (!rule.weekdays?.length) return false;
	if (!rule.weekdays.includes(weekday)) return false;

	// 4) Events constraint (if present)
	if (rule.events && !ctx.events.has(key)) return false;

	return true;
}

export function computeRuleImpact(rule: ScheduleRule, ctx: CalendarContext) {
	const affected: CalendarKey[] = [];

	// Convert JS Date range into civil calendar keys
	const startKey = calendarKey(Dates.fromJSDate(ctx.startDate));
	const endKey = calendarKey(Dates.fromJSDate(ctx.endDate));

	// Ensure ordering
	const from = startKey < endKey ? startKey : endKey;
	const to = startKey < endKey ? endKey : startKey;

	// Iterate by calendar keys using a stable Dates anchor (noon Lisbon)
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
