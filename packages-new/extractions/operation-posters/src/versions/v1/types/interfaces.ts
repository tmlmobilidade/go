/* * */

import { type GtfsStrictV30StopTimes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

export interface PDFStatus {
	[key: string]: unknown
	downloadLink?: string
	status: string
}

export interface TokenResponse {
	access_token: string
	expires_in: number
}

export interface GtfsDate {
	date: OperationalDateInt
	day_type: '1' | '2' | '3'
	holiday: '0' | '1'
	notes?: string
}

export interface GtfsCalendar {
	dates: Map<OperationalDateInt, GtfsDate>
	plan_id: string
}

export interface DayTypeConfig {
	_id: string
	day_type: '1' | '2' | '3'
	index: number
	name: string
}

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
