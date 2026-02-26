/* * */

import { resolveBusinessPeriod } from '@tmlmobilidade/dates';
import { BusinessPeriod, HHMM } from '@tmlmobilidade/types';

/* * */

export function groupTimesByPeriod(times: HHMM[]): Record<BusinessPeriod, HHMM[]> {
	const result: Record<BusinessPeriod, HHMM[]> = {
		CD: [],
		M: [],
		N: [],
		PPM: [],
		PPT: [],
	};

	if (!times?.length) return result;

	for (const time of times) {
		const period = resolveBusinessPeriod(time);
		result[period].push(time);
	}

	return result;
}
