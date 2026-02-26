/* * */

import { StopsParameter } from '@tmlmobilidade/types';

/* * */

export type StopsParameterExtended = StopsParameter & {
	name: string
	shortName: string
	travelTimes: {
		segmentTravelSeconds: { formatted: Array<string>, raw: Array<null | number> }
		stopDwellSeconds: { formatted: Array<string>, raw: Array<null | number> }
		totalTripSecondsWithoutStops: { formatted: string, raw: number }
		totalTripSecondsWithStops: { formatted: string, raw: number }
	}
};

/* * */
