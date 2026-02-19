/* * */

import { BusinessPeriod } from '@tmlmobilidade/types';

function getPeriodForTime(time: string): BusinessPeriod {
	const hour = parseInt(time.split(':')[0], 10);
	if (hour >= 6 && hour < 10) return 'ppm';
	if (hour >= 10 && hour < 16) return 'cd';
	if (hour >= 16 && hour < 20) return 'ppt';
	if (hour >= 20) return 'n';
	return 'm';
}

/* * */

export function groupTimesByPeriod(times: string[]): Record<BusinessPeriod, string[]> {
	const result: Record<BusinessPeriod, string[]> = {
		cd: [],
		m: [],
		n: [],
		ppm: [],
		ppt: [],
	};

	if (!times?.length) return result;

	for (const time of times) {
		const period = getPeriodForTime(time);
		result[period].push(time);
	}

	return result;
}
