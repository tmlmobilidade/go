import type { EventReplacementRule, Holiday, OperationalDate } from '@tmlmobilidade/types';

import { calendarKey, calendarWeekday } from '@/calendar/utils/index.js';
import { Dates } from '@/dates.js';

/**
 * Resolves the effective replacement targets for a date, applying same_weekday semantics.
 */
export function resolveEffectiveReplacement(
	date: OperationalDate,
	replacement: EventReplacementRule,
	holidays: Holiday[],
): EventReplacementRule {
	const key = calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));

	if (replacement.same_weekday) {
		return { ...replacement, weekdays: [calendarWeekday(key, holidays)] };
	}

	return replacement;
}

/**
 * True when the calendar weekday is not among the replacement's target weekdays —
 * the day is forcibly retargeted (e.g. Tuesday treated as Saturday for Carnival).
 */
export function isForcedRetargetDay(
	date: OperationalDate,
	effectiveReplacement: EventReplacementRule,
	holidays: Holiday[],
): boolean {
	const key = calendarKey(Dates.fromOperationalDate(date, 'Europe/Lisbon'));
	const calendarDay = calendarWeekday(key, holidays);
	const targetWeekdays = effectiveReplacement.weekdays ?? [];

	if (!targetWeekdays.length) return false;

	return !targetWeekdays.includes(calendarDay);
}
