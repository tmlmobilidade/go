import type { EventReplacementRule } from '@tmlmobilidade/go-types-offer';
import type { OperationalDateInt } from '@tmlmobilidade/go-types-shared';

import { calendarWeekday } from '@/scheduling-calendar.js';
import { type Holiday } from '@tmlmobilidade/go-types-dates';
import { calendarKey, Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Resolves the effective replacement targets for a date, applying same_weekday semantics.
 */
export function resolveEffectiveReplacement(
	date: OperationalDateInt,
	replacement: EventReplacementRule,
	holidays: Holiday[],
): EventReplacementRule {
	const key = calendarKey(Dates.fromOperationalDateInt(date, 'Europe/Lisbon'));

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
	date: OperationalDateInt,
	effectiveReplacement: EventReplacementRule,
	holidays: Holiday[],
): boolean {
	const key = calendarKey(Dates.fromOperationalDateInt(date, 'Europe/Lisbon'));
	const calendarDay = calendarWeekday(key, holidays);
	const targetWeekdays = effectiveReplacement.weekdays ?? [];

	if (!targetWeekdays.length) return false;

	return !targetWeekdays.includes(calendarDay);
}
