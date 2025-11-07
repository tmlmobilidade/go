import { Stop } from '@carrismetropolitana/api-types/network';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { agencies, hashedShapes, hashedTrips, rides } from '@tmlmobilidade/interfaces';
import { HashedShape, HashedTrip, Ride } from '@tmlmobilidade/types';

import { DrtAgency, DrtHashedShape, DrtHashedTrip } from './drt.types.js';
import { GLOBAL_CONTEXT } from './index.js';

export async function processor() {
	try {
		//

		await Promise.all([
			processAgencies(),
			processStops(),
			processRides(),
		]);
	}
	catch (error) {
		LOGGER.error('Error processing.', error);
		throw new Error('✖︎ Error processing rides.');
	}
}

async function processRides() {
	//

	LOGGER.info('Processing Rides...');
	const timer = new TIMETRACKER();

	const hashedShapesIds = new Set<string>();
	const hashedTripsIds = new Set<string>();

	const ridesCollection = await rides.getCollection();
	const ridesStream = ridesCollection.find({
		end_time_scheduled: { $lte: GLOBAL_CONTEXT.configs.end_date },
		start_time_scheduled: { $gte: GLOBAL_CONTEXT.configs.start_date },
	}).stream();

	let totalRides = 0;

	for await (const ride of ridesStream as unknown as AsyncIterableIterator<Ride>) {
		//
		totalRides++;

		//
		// Handle Hashed Trip and Hashed Shape
		// Set.add() automatically handles duplicates, no need to check first
		hashedTripsIds.add(ride.hashed_trip_id);
		hashedShapesIds.add(ride.hashed_shape_id);

		/* * */
		/* Write the ride to the database */
		GLOBAL_CONTEXT.tables.rides.write({
			_id: ride._id,

			/* Ride */
			end_time_scheduled: ride.end_time_scheduled,
			extension_scheduled: ride.extension_scheduled,

			hashed_shape_id: ride.hashed_shape_id,
			hashed_trip_id: ride.hashed_trip_id,
			headsign: ride.headsign,
			operational_date: ride.operational_date,
			pattern_id: ride.pattern_id,

			plan_id: ride.plan_id,
			route_id: ride.route_id,
			start_time_scheduled: ride.start_time_scheduled,
			trip_id: ride.trip_id,

			/* DRT-specific */

			da_trip_number: 0,
			driver_id: ride.driver_ids.length > 0 ? ride.driver_ids.join(',') : '',
			va_trip_number: 0,
			vehicle_id: ride.vehicle_ids.length > 0 ? ride.vehicle_ids.join(',') : '',
		});

		if (totalRides % 10000 === 0) {
			LOGGER.info(`Processed ${totalRides} rides so far...`);
		}
	}

	// Flush the rides table to ensure all buffered writes are persisted
	GLOBAL_CONTEXT.tables.rides.flush();

	LOGGER.info(`Processed ${totalRides} Rides in ${timer.get()}.`);

	await Promise.all([
		processHashedTrips(hashedTripsIds),
		processHashedShapes(hashedShapesIds),
	]);
}

async function processHashedTrips(hashedTripsIds: Set<string>) {
	try {
		//
		LOGGER.info('Processing Hashed Trips...');
		const hashedTripsTimer = new TIMETRACKER();

		const hashedTripsCollection = await hashedTrips.getCollection();
		const hashedTripsStream = hashedTripsCollection.find({ _id: { $in: Array.from(hashedTripsIds) } }).stream();

		let totalHashedTrips = 0;
		for await (const hashedTrip of hashedTripsStream as unknown as AsyncIterableIterator<HashedTrip>) {
			//
			totalHashedTrips++;

			//
			for (const stop of hashedTrip.path) {
				const drtHashedTrip: DrtHashedTrip = {
					_id: `${hashedTrip._id}-${stop.stop_sequence}-${stop.stop_id}`,
					arrival_time: stop.arrival_time,
					departure_time: stop.departure_time,
					hashed_trip_id: hashedTrip._id,
					shape_dist_traveled: stop.shape_dist_traveled,
					stop_id: stop.stop_id,
					stop_sequence: stop.stop_sequence,
				};

				GLOBAL_CONTEXT.tables.hashed_trips.write(drtHashedTrip);
			}
		}

		GLOBAL_CONTEXT.tables.hashed_trips.flush();

		LOGGER.info(`Processed ${totalHashedTrips} Hashed Trips in ${hashedTripsTimer.get()}.`);
	}
	catch (error) {
		LOGGER.error('Error processing Hashed Trips.', error); ;
		throw new Error('✖︎ Error processing Hashed Trips.');
	}
}

async function processHashedShapes(hashedShapesIds: Set<string>) {
	try {
		//

		LOGGER.info('Processing Hashed Shapes...');
		const hashedShapesTimer = new TIMETRACKER();

		const hashedShapesCollection = await hashedShapes.getCollection();
		const hashedShapesStream = hashedShapesCollection.find({ _id: { $in: Array.from(hashedShapesIds) } }).stream();

		let totalHashedShapes = 0;

		for await (const hashedShape of hashedShapesStream as unknown as AsyncIterableIterator<HashedShape>) {
			//
			totalHashedShapes++;

			//
			const lastPointShapeDistTraveled = hashedShape.points[hashedShape.points.length - 1].shape_dist_traveled;

			for (const [index, point] of hashedShape.points.entries()) {
				//

				//
				// Calculate the meters from the previous stop, start, end, and next stop
				const meters_to_end = lastPointShapeDistTraveled - point.shape_dist_traveled;
				const meters_from_previous_stop = index === 0 ? 0 : point.shape_dist_traveled - hashedShape.points[index - 1].shape_dist_traveled;
				const meters_from_start = point.shape_dist_traveled;
				const meters_to_next_stop = index === hashedShape.points.length - 1 ? 0 : hashedShape.points[index + 1].shape_dist_traveled - point.shape_dist_traveled;

				//
				// Write the Hashed Shape to the database
				const drtHashedShape: DrtHashedShape = {
					_id: `${hashedShape._id}-${point.shape_pt_sequence}`,
					hashed_shape_id: hashedShape._id,
					shape_dist_traveled: point.shape_dist_traveled,
					shape_pt_lat: point.shape_pt_lat,
					shape_pt_lon: point.shape_pt_lon,
					shape_pt_sequence: point.shape_pt_sequence,
					/* * */
					meters_from_previous_stop: meters_from_previous_stop,
					meters_from_start: meters_from_start,
					meters_to_end: meters_to_end,
					meters_to_next_stop: meters_to_next_stop,
				};

				GLOBAL_CONTEXT.tables.shapes.write(drtHashedShape);
			}
		}

		GLOBAL_CONTEXT.tables.shapes.flush();

		LOGGER.info(`Processed ${totalHashedShapes} Hashed Shapes in ${hashedShapesTimer.get()}.`);
	}
	catch (error) {
		LOGGER.error('Error processing Hashed Shapes.', error);
		throw new Error('✖︎ Error processing Hashed Shapes.');
	}
}

async function processAgencies() {
	try {
		//

		LOGGER.info('Processing Agencies...');
		const agenciesTimer = new TIMETRACKER();

		const allAgencies = await agencies.findMany({}, { sort: { _id: 1 } });

		let totalAgencies = 0;

		for (const agency of allAgencies) {
			//
			totalAgencies++;

			//
			const drtAgency: DrtAgency = {
				_id: agency._id,
				agency_name: agency.name,
			};

			GLOBAL_CONTEXT.tables.agencies.write(drtAgency);
		}

		GLOBAL_CONTEXT.tables.agencies.flush();

		LOGGER.info(`Processed ${totalAgencies} Agencies in ${agenciesTimer.get()}.`);
	}
	catch (error) {
		LOGGER.error('Error processing Agencies.', error);
		throw new Error('✖︎ Error processing Agencies.');
	}
}

async function processStops() {
	try {
		//

		//
		LOGGER.info('Processing Stops...');
		const stopsTimer = new TIMETRACKER();

		//
		// Fetch the stops from the API
		const endpoint = 'https://api.carrismetropolitana.pt/stops';
		const response = await fetch(endpoint);
		if (!response.ok) throw new Error('Failed to fetch stops.');

		const data = await response.json() as Stop[];
		let totalStops = 0;
		for (const stop of data) {
			//
			totalStops++;

			//
			GLOBAL_CONTEXT.tables.stops.write({
				_id: stop.id,
				district_id: stop.district_id,
				latitude: stop.lat,
				locality_id: stop.locality_id,
				longitude: stop.lon,
				municipality_id: stop.municipality_id,
				parish_id: '',
				// @ts-expect-error - stop.name is not defined in the type but it is what is coming from the API
				stop_name: stop.name,
				tts_name: stop.tts_name,
			});
		}
		GLOBAL_CONTEXT.tables.stops.flush();

		LOGGER.info(`Processed ${totalStops} Stops in ${stopsTimer.get()}.`);
	}
	catch (error) {
		LOGGER.error('Error processing Stops.', error);
		throw new Error('✖︎ Error processing Stops.');
	}
}
