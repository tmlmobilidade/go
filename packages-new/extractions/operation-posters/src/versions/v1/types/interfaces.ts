/* * */

import { type GtfsStrictV30StopTimes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

// controller types
export interface PDFStatus {
	[key: string]: unknown
	downloadLink?: string
	status: string
}

export interface TokenResponse {
	access_token: string
	expires_in: number
}

/* * */

// GTFS types
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

/* * */

// operation posters types
export interface DayTypeConfig {
	_id: string
	day_type: '1' | '2' | '3'
	index: number
	name: string
}

/* * */

// calendar services types
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

/* * */

// stop canvas targets types

export interface StopRouteDirection {
	direction_id: number
	route_id: string
	stop_count: number
	stop_id: string
}

/* * */

// writer options types
export interface PosterWriterOptions<T> {
	batch_size?: number
	fields?: Extract<keyof T, string>[]
	include_bom?: boolean
	newline?: string
	quotes?: Papa.UnparseConfig['quotes']
}
