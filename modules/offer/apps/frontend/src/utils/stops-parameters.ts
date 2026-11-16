/* * */

import { StopsParameter } from '@tmlmobilidade/go-types-offer';
import { SegmentTravelTimes } from '@tmlmobilidade/go-utils-offer';

/* * */

export type StopsParameterExtended = StopsParameter & {
	name: string
	shortName: string
	travelTimes: SegmentTravelTimes
};

/* * */

/** Copies defaults by visit position; equal stop IDs can represent different visits. */
export function copyDefaultStopParameters(current: StopsParameter['path'], defaults: StopsParameter['path']): StopsParameter['path'] {
	return current.map((item, index) => {
		const source = defaults[index];
		return source?.stop_id === item.stop_id ? { ...item, avg_speed: source.avg_speed, dwell_time: source.dwell_time } : item;
	});
}
