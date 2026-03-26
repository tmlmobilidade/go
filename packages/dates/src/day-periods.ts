/* * */

import { DAY_PERIOD_TIME_RANGES, DayPeriod, HHMM, timeToMinutes } from '@tmlmobilidade/types';

/**
 * Resolves a day period (M, PPM, CD, PPT, N) from a timepoint (HH:mm)
 */
export function resolveDayPeriod(timepoint: HHMM): DayPeriod {
	const totalMinutes = timeToMinutes(timepoint);

	for (const [period, ranges] of Object.entries(DAY_PERIOD_TIME_RANGES) as Array<[DayPeriod, Array<{ end: HHMM, start: HHMM }>]>) {
		for (const range of ranges) {
			const startMinutes = timeToMinutes(range.start);
			const endMinutes = timeToMinutes(range.end);

			if (totalMinutes >= startMinutes && totalMinutes <= endMinutes) {
				return period;
			}
		}
	}

	// Fallback (should not happen if ranges cover the full operational day)
	return 'N';
}

export function groupTimesByDayPeriod(times: HHMM[]): Record<DayPeriod, HHMM[]> {
	const result: Record<DayPeriod, HHMM[]> = {
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
