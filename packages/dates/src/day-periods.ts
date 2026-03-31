/* * */

import { DAY_PERIOD_TIME_RANGES, DayPeriod, timeToMinutes } from '@tmlmobilidade/types';

const MINUTES_PER_DAY = 24 * 60;

function toCivilMinutesOfDay(time: string): number {
	return timeToMinutes(time, true) % MINUTES_PER_DAY;
}

function isWithinRange(time: number, start: number, end: number): boolean {
	// Normal range, e.g. 06:00 -> 09:59
	if (start <= end) {
		return time >= start && time <= end;
	}

	// Wrapped range, e.g. 20:00 -> 05:59
	return time >= start || time <= end;
}

/**
 * Resolves a day period (M, PPM, CD, PPT, N) from a timepoint (HH:mm).
 *
 * If the time is past 24:00, it is folded back into the civil-day clock
 * by repeatedly subtracting 24h, so:
 * - 24:30 -> 00:30
 * - 26:20 -> 02:20
 * - 29:20 -> 05:20
 */
export function resolveDayPeriod(timepoint: string): DayPeriod {
	const timeMinutes = toCivilMinutesOfDay(timepoint);

	for (const [period, range] of Object.entries(DAY_PERIOD_TIME_RANGES) as Array<[DayPeriod, { end: string, start: string }]>) {
		const startMinutes = toCivilMinutesOfDay(range.start);
		const endMinutes = toCivilMinutesOfDay(range.end);

		if (isWithinRange(timeMinutes, startMinutes, endMinutes)) {
			return period;
		}
	}

	return 'N';
}

export function groupTimesByDayPeriod(times: string[]): Record<DayPeriod, string[]> {
	const result: Record<DayPeriod, string[]> = {
		CD: [],
		M: [],
		N: [],
		PPM: [],
		PPT: [],
	};

	if (!times?.length) return result;

	for (const time of times) {
		const period = resolveDayPeriod(time);
		result[period].push(time);
	}

	return result;
}
