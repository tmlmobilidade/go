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
