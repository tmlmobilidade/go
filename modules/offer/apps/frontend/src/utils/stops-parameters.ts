/* * */

import { SegmentTravelTimes } from '@tmlmobilidade/dates';
import { StopsParameter } from '@tmlmobilidade/types';

/* * */

export type StopsParameterExtended = StopsParameter & {
	name: string
	shortName: string
	travelTimes: SegmentTravelTimes
};

/* * */
