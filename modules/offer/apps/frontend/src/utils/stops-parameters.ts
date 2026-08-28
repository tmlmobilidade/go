/* * */

import { SegmentTravelTimes } from '@tmlmobilidade/go-utils-dates';
import { StopsParameter } from '@tmlmobilidade/go-types-offer';

/* * */

export type StopsParameterExtended = StopsParameter & {
	name: string
	shortName: string
	travelTimes: SegmentTravelTimes
};

/* * */
