/* * */

import { BUSINESS_PERIOD_TIME_RANGES, BusinessPeriod, HHMM, timeToMinutes } from '@tmlmobilidade/types';

/**
 * Resolves a business period (M, PPM, CD, PPT, N) from a timepoint (HH:mm)
 */
export function resolveBusinessPeriod(timepoint: HHMM): BusinessPeriod {
	const totalMinutes = timeToMinutes(timepoint);

	for (const [period, range] of Object.entries(BUSINESS_PERIOD_TIME_RANGES) as Array<[BusinessPeriod, { end: HHMM, start: HHMM }]>) {
		const startMinutes = timeToMinutes(range.start);
		const endMinutes = timeToMinutes(range.end);

		if (totalMinutes >= startMinutes && totalMinutes <= endMinutes) {
			return period;
		}
	}

	// Fallback (should not happen with valid ranges)
	return 'N';
}
