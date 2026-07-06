import { Stop } from '@carrismetropolitana/api-types/network';
import { agencies, hashedShapes, hashedTrips, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { HashedShape, HashedTrip, Ride } from '@tmlmobilidade/types';

import { DrtAgency, DrtHashedShape, DrtHashedTrip } from './drt.types.js';
import { GLOBAL_CONTEXT } from './index.js';

class IndexedValues<T> {
	private indexMap = new Map<T, number>();
	private items = new Set<T>();

	add(value: T) {
		if (!this.items.has(value)) {
			this.items.add(value);
			this.indexMap.set(value, this.indexMap.size);
		}
	}

	delete(value: T) {
		if (!this.items.has(value)) return false;
		// Note: This leaves "holes" in indexes unless you rebuild the map
		this.items.delete(value);
		this.indexMap.delete(value);
		return true;
	}

	getIndex(value: T): number | undefined {
		return this.indexMap.get(value);
	}

	has(value: T) {
		return this.items.has(value);
	}

	values() {
		return this.items.values();
	}
}

function round(value: number) {
	return Math.round((value + Number.EPSILON) * 10) / 10;
}

export async function processor() {
	try {
		//

		await processAgencies();
		await processRides();
	} catch (error) {
		Logger.error({ error, message: 'Error processing.' });
		throw new Error('✖︎ Error processing rides.');
	}
}

async function processRides() {
	//

	Logger.info({ message: 'Processing Rides...' });
	const timer = new Timer();

	const hashedShapesIds = new IndexedValues<string>();
	const hashedTripsIds = new IndexedValues<string>();

	const ridesCollection = await rides.getCollection();
	const ridesStream = ridesCollection.find({
		agency_id: GLOBAL_CONTEXT.configs.agency_id,
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
			agency_id: ride.agency_id,
			end_time_scheduled: ride.end_time_scheduled,

			extension_scheduled: ride.extension_scheduled,
			hashed_shape_id: hashedShapesIds.getIndex(ride.hashed_shape_id),
			hashed_trip_id: hashedTripsIds.getIndex(ride.hashed_trip_id),
			headsign: ride.headsign,
			operational_date: ride.operational_date,

			pattern_id: ride.pattern_id,
			plan_id: ride.plan_id,
			route_id: ride.route_id,
			start_time_scheduled: ride.start_time_scheduled,
			trip_id: ride.trip_id,

			/* DRT-specific */

			block_id: '',
			start_shift_id: '',

			/* * */

			da_trip_number: 0,
			va_trip_number: 0,
		});

		if (totalRides % 10000 === 0) {
			Logger.info({ message: `Processed ${totalRides} rides so far...` });
		}
	}

	// Flush the rides table to ensure all buffered writes are persisted
	GLOBAL_CONTEXT.tables.rides.flush();

	Logger.info({ message: `Processed ${totalRides} Rides in ${timer.get()}.` });

	await Promise.all([
		processHashedTrips(hashedTripsIds).then(stopIds => processStops(stopIds)),
		processHashedShapes(hashedShapesIds),
	]);
}

async function processHashedTrips(hashedTripsIds: IndexedValues<string>): Promise<Set<string>> {
	try {
		//
		Logger.info({ message: 'Processing Hashed Trips...' });
		const hashedTripsTimer = new Timer();

		const stopIds = new Set<string>();

		const hashedTripsCollection = await hashedTrips.getCollection();
		const hashedTripsStream = hashedTripsCollection.find({ _id: { $in: Array.from(hashedTripsIds.values()) } }).stream();

		let totalHashedTrips = 0;
		for await (const hashedTrip of hashedTripsStream as unknown as AsyncIterableIterator<HashedTrip>) {
			//
			totalHashedTrips++;

			//
			for (const stop of hashedTrip.path) {
				const hashed_trip_idx = hashedTripsIds.getIndex(hashedTrip._id);
				if (hashed_trip_idx === undefined) throw new Error(`Hashed trip "${hashedTrip._id}" not found in the index.`);

				const drtHashedTrip: DrtHashedTrip = {
					_id: `${hashed_trip_idx}-${stop.stop_sequence}-${stop.stop_id}`,
					arrival_time: stop.arrival_time,
					departure_time: stop.departure_time,
					hashed_trip_id: hashed_trip_idx,
					shape_dist_traveled: round(stop.shape_dist_traveled),
					stop_id: stop.stop_id,
					stop_sequence: stop.stop_sequence,
				};

				GLOBAL_CONTEXT.tables.hashed_trips.write(drtHashedTrip);

				stopIds.add(stop.stop_id);
			}
		}

		GLOBAL_CONTEXT.tables.hashed_trips.flush();

		Logger.info({ message: `Processed ${totalHashedTrips} Hashed Trips in ${hashedTripsTimer.get()}.` });

		return stopIds;
	} catch (error) {
		Logger.error({ error, message: 'Error processing Hashed Trips.' }); ;
		throw new Error('✖︎ Error processing Hashed Trips.');
	}
}

async function processHashedShapes(hashedShapesIds: IndexedValues<string>) {
	try {
		//

		Logger.info({ message: 'Processing Hashed Shapes...' });
		const hashedShapesTimer = new Timer();

		const hashedShapesCollection = await hashedShapes.getCollection();
		const hashedShapesStream = hashedShapesCollection.find({ _id: { $in: Array.from(hashedShapesIds.values()) } }).stream();

		let totalHashedShapes = 0;

		for await (const hashedShape of hashedShapesStream as unknown as AsyncIterableIterator<HashedShape>) {
			//
			totalHashedShapes++;

			//
			for (const point of hashedShape.points) {
				//
				// Write the Hashed Shape to the database
				const hashed_shape_idx = hashedShapesIds.getIndex(hashedShape._id);
				if (hashed_shape_idx === undefined) throw new Error(`Hashed shape "${hashedShape._id}" not found in the index.`);

				//
				const drtHashedShape: DrtHashedShape = {
					_id: `${hashed_shape_idx}-${point.shape_pt_sequence}`,
					hashed_shape_id: hashed_shape_idx,
					shape_dist_traveled: round(point.shape_dist_traveled),
					shape_pt_lat: point.shape_pt_lat,
					shape_pt_lon: point.shape_pt_lon,
					shape_pt_sequence: point.shape_pt_sequence,
				};

				GLOBAL_CONTEXT.tables.shapes.write(drtHashedShape);
			}
		}

		GLOBAL_CONTEXT.tables.shapes.flush();

		Logger.info({ message: `Processed ${totalHashedShapes} Hashed Shapes in ${hashedShapesTimer.get()}.` });
	} catch (error) {
		Logger.error({ error, message: 'Error processing Hashed Shapes.' });
		throw new Error('✖︎ Error processing Hashed Shapes.');
	}
}

async function processAgencies() {
	try {
		//

		Logger.info({ message: 'Processing Agencies...' });
		const agenciesTimer = new Timer();

		const allAgencies = await agencies.findOne({ _id: GLOBAL_CONTEXT.configs.agency_id });
		if (allAgencies === null) throw new Error(`Agency "${GLOBAL_CONTEXT.configs.agency_id}" not found.`);

		const drtAgency: DrtAgency = {
			_id: allAgencies._id,
			agency_name: allAgencies.name,
		};

		GLOBAL_CONTEXT.tables.agencies.write(drtAgency);
		GLOBAL_CONTEXT.tables.agencies.flush();

		Logger.info({ message: `Processed 1 Agency in ${agenciesTimer.get()}.` });
	} catch (error) {
		Logger.error({ error, message: 'Error processing Agencies.' });
		throw new Error('✖︎ Error processing Agencies.');
	}
}

async function processStops(stopIds: Set<string>) {
	try {
		//

		//
		Logger.info({ message: 'Processing Stops...' });
		const stopsTimer = new Timer();

		//
		// Fetch the stops from the API
		const endpoint = 'https://api.carrismetropolitana.pt/stops';
		const response = await fetch(endpoint);
		if (!response.ok) throw new Error('Failed to fetch stops.');

		const data = await response.json() as Stop[];
		let totalStops = 0;
		for (const stop of data) {
			if (!stopIds.has(stop.id)) continue;

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

		Logger.info({ message: `Processed ${totalStops} Stops in ${stopsTimer.get()}.` });
	} catch (error) {
		Logger.error({ error, message: 'Error processing Stops.' });
		throw new Error('✖︎ Error processing Stops.');
	}
}
