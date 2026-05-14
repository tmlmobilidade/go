/* * */

import { GTFSBool } from 'gtfs-types';
import * as GtfsCore from 'gtfs-types';

/* * */

/**
 * Type for GTFS routes.txt file.
 */
export interface Route extends GtfsCore.Route {
	line_id: string
	line_long_name: string
	line_short_name: string
}

/**
 * Type for GTFS calendar_dates.txt file.
 */
export interface CalendarDate extends GtfsCore.CalendarDates {
	day_type: string
	holiday: string
	period: string
}

/**
 * Type for GTFS dates.txt file.
 */
export interface Date {
	date: string
	day_type: string
	description: string
	holiday: string
	period: string
}

/**
 * Type for GTFS periods.txt file.
 */
export interface Period {
	period_id: string
	period_name: string
}

/**
 * Type for GTFS trips.txt file.
 */
export interface Trip extends GtfsCore.Trip {
	calendar_desc: string
	pattern_id: string
}

/**
 * Type for GTFS stop_times.txt file.
 */
export type StopTime = GtfsCore.StopTime;

/**
 * Type for GTFS shapes.txt file.
 */
export type Shape = GtfsCore.Shapes;

/**
 * Type for GTFS stops.txt file.
 */
export interface Stop extends GtfsCore.Stop {
	airport: boolean
	bike_parking: boolean
	bike_sharing: boolean
	boat: boolean
	car_parking: boolean
	district_id: string
	district_name: string
	light_rail: boolean
	locality_id: string
	locality_name: string
	municipality_id: string
	municipality_name: string
	near_fire_station: boolean
	near_health_clinic: boolean
	near_historic_building: boolean
	near_hospital: boolean
	near_police_station: boolean
	near_school: boolean
	near_shopping: boolean
	near_transit_office: boolean
	near_university: boolean
	operational_status: string
	parish_id: null
	parish_name: null
	stop_id: string
	stop_lat: number
	stop_lon: number
	stop_name: string
	stop_short_name: string
	subway: boolean
	train: boolean
	tts_stop_name: string
	wheelchair_boarding: GtfsCore.WheelchairBoardingType
}

// /**
//  * Type for GTFS vehicles.txt file.
//  */
// export interface Vehicle {
// 	agency_id: string
// 	bikes_allowed: GTFSBool
// 	capacity_seated: number
// 	capacity_standing: number
// 	emission_class: string
// 	license_plate: string
// 	make: string
// 	model: string
// 	owner: string
// 	passenger_counting: GTFSBool
// 	propulsion: string
// 	registration_date: string
// 	vehicle_id: string
// 	wheelchair_accessible: GTFSBool
// }

/* * */

export interface VehicleEvent {
	content: VehicleEventContent
	millis: number
}

export interface VehicleEventContent {
	entity: VehicleEventEntity[]
	header: GtfsCore.FeedHeader
}

export interface VehicleEventEntity {
	_id: string
	vehicle: VehiclePosition
}

export interface VehiclePosition {
	agencyId: string
	currentStatus: GtfsCore.VehicleStopStatus
	operationPlanId: string
	passengerCounting: VehiclePositionPassengerCounting
	position: GtfsCore.Position
	stopId: string
	timestamp: number
	trigger: VehiclePositionTrigger
	trip: VehiclePositionTrip
	vehicle: VehiclePositionVehicle
}

export interface VehiclePositionTrigger {
	activity: string
	door: string
}

export interface VehiclePositionTrip {
	lineId: string
	patternId: string
	routeId: string
	scheduleRelationship: GtfsCore.TripScheduleRelationship
	tripId: string
}

export interface VehiclePositionVehicle {
	_id: string
	blockId: string
	driverId: string
	shiftId: string
}

export interface VehiclePositionPassengerCounting {
	counting: VehiclePositionPassengerCountingCount[]
}

export interface VehiclePositionPassengerCountingCount {
	classId: 'adult' | 'children'
	incoming: number
	outgoing: number
}

/* * */

export function convertGTFSBoolToBoolean(value: GTFSBool): boolean {
	return Number(value) === GTFSBool.YES ? true : false;
}
