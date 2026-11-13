/* * */

import { type GtfsStrictV30StopTimes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

import { type GtfsDate } from './gtfs-date.js';

/* * */

export interface CalendarService {
	_id: string
	dates: OperationalDateInt[]
	day_type: GtfsDate['day_type']
}

export interface TripGroup {
	serviceIds: Set<string>
	startTime: string
	stopTimes: GtfsStrictV30StopTimes[]
	trip: GtfsStrictV30Trips
	tripIds: string[]
}

export interface DateGroup {
	dates: Set<OperationalDateInt>
	day_type: GtfsDate['day_type']
}
