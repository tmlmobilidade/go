/* * */

import { toMetersFromKilometersOrMeters } from '@tmlmobilidade/geo';
import { type GtfsStrictV30Stops, type GtfsStrictV30StopTimes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type CreateHashedTrip, CreateHashedTripSchema, type HashedTrip, HashedTripSchema, type Plan } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import crypto from 'crypto';

const HashedTripMetadataSchema = HashedTripSchema.pick({ _id: true, updated_at: true });

/**
 * Transforms the GTFS trip data into a HashedTrip.
 * @param planData The plan data.
 * @param tripData The GTFS trip data to transform into a HashedTrip.
 * @param stopTimesData The GTFS stop times data, ordered numerically by stop_sequence by the caller.
 * @param stopsData The GTFS stops data to transform into a HashedTrip.
 * @returns The HashedTrip items.
 */
export function toHashedTrip(planData: Plan, tripData: GtfsStrictV30Trips, stopTimesData: GtfsStrictV30StopTimes[], stopsData: GtfsStrictV30Stops[]): HashedTrip[] {
	//

	//
	// Extract commonly used variables to avoid
	// repeated lookups and calculations.

	const lastStopTime = stopTimesData[stopTimesData.length - 1];
	if (!lastStopTime) throw new Error(`No stop times for trip "${tripData.trip_id}" for Plan "${planData._id}".`);

	const stopsById = new Map<string, GtfsStrictV30Stops>();
	for (const stop of stopsData) {
		// Preserve the first-match behavior of Array.find for duplicate stop IDs.
		if (!stopsById.has(stop.stop_id)) stopsById.set(stop.stop_id, stop);
	}

	//
	// Build the HashedTrip data, including formatting the path data by combining
	// properties from the ordered stop_times and stops.

	const formattedCreateHashedTripItems: CreateHashedTrip[] = [];

	for (const stopTime of stopTimesData) {
		// Get the corresponding stop data for this stop_time
		const stopData = stopsById.get(stopTime.stop_id);
		if (!stopData) throw new Error(`Stop "${stopTime.stop_id}" not found for trip "${tripData.trip_id}" for Plan "${planData._id}".`);
		// Normalize the shape_dist_traveled to meters, if necessary
		const normalizedShapeDistTraveled = toMetersFromKilometersOrMeters(stopTime.shape_dist_traveled, lastStopTime.shape_dist_traveled);
		// Validate this stop_time in the schema
		const validatedCreateHashedTripItem = CreateHashedTripSchema.parse({
			agency_id: planData.agency_id,
			arrival_time: stopTime.arrival_time,
			departure_time: stopTime.departure_time,
			drop_off_type: stopTime.drop_off_type,
			pickup_type: stopTime.pickup_type,
			shape_dist_traveled: normalizedShapeDistTraveled,
			shape_id: tripData.shape_id,
			stop_id: stopTime.stop_id,
			stop_lat: stopData.stop_lat,
			stop_lon: stopData.stop_lon,
			stop_name: stopData.stop_name,
			stop_sequence: stopTime.stop_sequence,
			timepoint: stopTime.timepoint === '1' ? true : false,
		});
		// Save the formatted path data for this stop_time
		formattedCreateHashedTripItems.push(validatedCreateHashedTripItem);
	}

	//
	// Hash the canonical payload. All stop rows share the same content ID.

	const uniqueIdValueForHashedTrip = crypto
		.createHash('sha256')
		.update(JSON.stringify(formattedCreateHashedTripItems))
		.digest('hex');

	//
	// Payload fields are already validated; validate generated metadata once.

	const metadata = HashedTripMetadataSchema.parse({
		_id: uniqueIdValueForHashedTrip,
		updated_at: Dates.now('utc').unix_milliseconds,
	});

	return formattedCreateHashedTripItems.map((item): HashedTrip => ({ ...item, ...metadata }));
}
