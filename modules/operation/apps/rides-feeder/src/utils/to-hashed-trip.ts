/* * */

import { toMetersFromKilometersOrMeters } from '@tmlmobilidade/geo';
import { type GtfsStrictV30Stops, type GtfsStrictV30StopTimes, type GtfsStrictV30Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type CreateHashedTrip, CreateHashedTripSchema, type HashedTrip, HashedTripSchema, type Plan } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Timer } from '@tmlmobilidade/timer';
import crypto from 'crypto';

/* * */

export function toHashedTrip(planData: Plan, tripData: GtfsStrictV30Trips, stopTimesData: GtfsStrictV30StopTimes[], stopsData: GtfsStrictV30Stops[]): HashedTrip[] {
	//

	const timer = new Timer();

	//
	// Extract commonly used variables to avoid
	// repeated lookups and calculations.

	const sortedStopTimesData = stopTimesData?.sort((a, b) => a.stop_sequence - b.stop_sequence);

	const lastStopTime = sortedStopTimesData[sortedStopTimesData.length - 1];

	//
	// Build the HashedTrip data, including formatting the path data by combining
	// properties from stop_times and stops. Sort it by stop_sequence to ensure
	// the order is stable for hashing.

	const formattedCreateHashedTripItems: CreateHashedTrip[] = [];

	for (const stopTime of sortedStopTimesData) {
		// Get the corresponding stop data for this stop_time
		const stopData = stopsData.find(stop => stop.stop_id === stopTime.stop_id);
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

	const sortedCreateHashedTripItems = formattedCreateHashedTripItems.sort((a, b) => {
		return a.stop_sequence - b.stop_sequence;
	});

	//
	// Hash the object contents and check if it already exists in the database.
	// The hash value is the _id of the HashedTrip item.

	const uniqueIdValueForHashedTrip = crypto
		.createHash('sha256')
		.update(JSON.stringify(sortedCreateHashedTripItems))
		.digest('hex');

	//
	// Check if there are rows with this unique ID value.
	// If there are no rows, save the HashedTrip items to the database.

	const hashedTripItems = sortedCreateHashedTripItems.map((item): HashedTrip => {
		return HashedTripSchema.parse({
			...item,
			_id: uniqueIdValueForHashedTrip,
			updated_at: Dates.now('utc').unix_milliseconds,
		});
	});

	console.log(`Transformed trip data "${tripData.trip_id}" into a HashedTrip with ${hashedTripItems.length} stops "${uniqueIdValueForHashedTrip}" (${timer.get()})`);

	return hashedTripItems;
}
