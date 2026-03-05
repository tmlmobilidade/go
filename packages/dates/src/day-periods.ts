/* * */

import { DAY_PERIOD_TIME_RANGES, DayPeriod, HHMM, timeToMinutes } from '@tmlmobilidade/types';

/**
 * Resolves a day period (M, PPM, CD, PPT, N) from a timepoint (HH:mm)
 */
export function resolveDayPeriod(timepoint: HHMM): DayPeriod {
	const totalMinutes = timeToMinutes(timepoint);

	for (const [period, range] of Object.entries(DAY_PERIOD_TIME_RANGES) as Array<[DayPeriod, { end: HHMM, start: HHMM }]>) {
		const startMinutes = timeToMinutes(range.start);
		const endMinutes = timeToMinutes(range.end);

		if (totalMinutes >= startMinutes && totalMinutes <= endMinutes) {
			return period;
		}
	}

	// Fallback (should not happen with valid ranges)
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
