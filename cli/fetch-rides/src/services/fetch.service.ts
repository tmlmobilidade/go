import type { CliOptions } from '../cli/commands.js';
import type { FetchConfig } from '../config/config-loader.js';

import { Dates } from '@tmlmobilidade/dates';
import { type HashedShape, type HashedTrip, type OperationalDate, type Ride, type SimplifiedVehicleEvent, type UnixTimestamp } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';
import { type Collection, type Filter, MongoClient } from 'mongodb';

import { logger } from '../utils/logger.js';

export interface FetchedData {
	hashedShapes: HashedShape[]
	hashedTrips: HashedTrip[]
	rides: Ride[]
	vehicleEvents: SimplifiedVehicleEvent[]
}

function parseDate(dateString: string): UnixTimestamp {
	// Try operational date format first (yyyyMMdd)
	if (/^\d{8}$/.test(dateString)) {
		return Dates.fromOperationalDate(dateString as OperationalDate, 'Europe/Lisbon').unix_timestamp;
	}

	// Try ISO format (YYYY-MM-DD)
	if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
		const date = DateTime.fromISO(dateString, { zone: 'Europe/Lisbon' });
		if (!date.isValid) {
			throw new Error(`Invalid date format: ${dateString}`);
		}
		// Convert to operational date format
		const operationalDate = date.toFormat('yyyyMMdd');
		return Dates.fromOperationalDate(operationalDate as OperationalDate, 'Europe/Lisbon').unix_timestamp;
	}

	throw new Error(`Invalid date format: ${dateString}. Expected yyyyMMdd (e.g., 20240101) or YYYY-MM-DD (e.g., 2024-01-01)`);
}

function getStartOfDayTimestamp(dateString: string): UnixTimestamp {
	const timestamp = parseDate(dateString);
	const date = Dates.fromUnixTimestamp(timestamp);
	return date.startOf('day').set({ hour: 4 }).unix_timestamp;
}

function getEndOfDayTimestamp(dateString: string): UnixTimestamp {
	const timestamp = parseDate(dateString);
	const date = Dates.fromUnixTimestamp(timestamp);
	return date.endOf('day').set({ hour: 23, millisecond: 999, minute: 59, second: 59 }).unix_timestamp;
}

async function connectToMongoDB(config: FetchConfig['database']): Promise<MongoClient> {
	let uri: string;

	if (config.uri) {
		uri = config.uri;
	}
	else if (config.host && config.database) {
		const auth = config.username && config.password
			? `${encodeURIComponent(config.username)}:${encodeURIComponent(config.password)}@`
			: '';
		const authDb = config.authDatabase || 'admin';
		uri = `mongodb://${auth}${config.host}/${config.database}?authSource=${authDb}`;
	}
	else {
		throw new Error('MongoDB configuration incomplete. Provide either DATABASE_URI or host/database.');
	}

	logger.verbose(`Connecting to MongoDB: ${uri.replace(/:[^:@]+@/, ':****@')}`);

	const client = new MongoClient(uri);

	try {
		await client.connect();
		logger.verbose('Connected to MongoDB successfully');
		return client;
	}
	catch (error) {
		throw new Error(`Failed to connect to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
	}
}

async function fetchRides(
	ridesCollection: Collection<Ride>,
	startDate: string,
	endDate: string,
	tripId?: string,
	patternId?: string,
	routeId?: string,
): Promise<Ride[]> {
	const startTimestamp = getStartOfDayTimestamp(startDate);
	const endTimestamp = getEndOfDayTimestamp(endDate);

	logger.info(`Fetching rides from ${startDate} to ${endDate}...`);
	logger.verbose(`Date range: ${startTimestamp} to ${endTimestamp}`);

	const query: Filter<Ride> = {
		end_time_scheduled: { $lte: endTimestamp },
		start_time_scheduled: { $gte: startTimestamp },
	};

	if (tripId) {
		query.trip_id = tripId;
		logger.verbose(`Filtering by trip_id: ${tripId}`);
	}

	if (patternId) {
		query.pattern_id = patternId;
		logger.verbose(`Filtering by pattern_id: ${patternId}`);
	}

	if (routeId) {
		query.route_id = routeId;
		logger.verbose(`Filtering by route_id: ${routeId}`);
	}

	const rides = await ridesCollection.find(query).toArray();
	logger.info(`Found ${rides.length} rides`);
	return rides;
}

async function fetchHashedTrips(
	hashedTripsCollection: Collection<HashedTrip>,
	hashedTripIds: string[],
): Promise<HashedTrip[]> {
	if (hashedTripIds.length === 0) {
		return [];
	}

	logger.info(`Fetching ${hashedTripIds.length} unique hashed trips...`);

	const hashedTrips = await hashedTripsCollection
		.find({ _id: { $in: hashedTripIds } })
		.toArray();

	logger.info(`Found ${hashedTrips.length} hashed trips`);
	return hashedTrips;
}

async function fetchHashedShapes(
	hashedShapesCollection: Collection<HashedShape>,
	hashedShapeIds: string[],
): Promise<HashedShape[]> {
	if (hashedShapeIds.length === 0) {
		return [];
	}

	logger.info(`Fetching ${hashedShapeIds.length} unique hashed shapes...`);

	const hashedShapes = await hashedShapesCollection
		.find({ _id: { $in: hashedShapeIds } })
		.toArray();

	logger.info(`Found ${hashedShapes.length} hashed shapes`);
	return hashedShapes;
}

async function fetchVehicleEvents(
	vehicleEventsCollection: Collection<SimplifiedVehicleEvent>,
	rides: Ride[],
): Promise<SimplifiedVehicleEvent[]> {
	if (rides.length === 0) {
		return [];
	}

	logger.info(`Fetching vehicle events for ${rides.length} rides...`);

	const allVehicleEvents: SimplifiedVehicleEvent[] = [];

	for (const ride of rides) {
		const standardWindowInterval = Dates.fromUnixTimestamp(ride.start_time_scheduled).std_window;

		const vehicleEvents = await vehicleEventsCollection
			.find({
				created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
				extra_trip_id: null,
				trip_id: ride.trip_id,
			})
			.toArray();

		allVehicleEvents.push(...vehicleEvents);
		logger.verbose(`Found ${vehicleEvents.length} vehicle events for ride ${ride._id}`);
	}

	// Deduplicate by _id
	const uniqueVehicleEvents = Array.from(
		new Map(allVehicleEvents.map(event => [event._id, event])).values(),
	);

	logger.info(`Found ${uniqueVehicleEvents.length} unique vehicle events`);
	return uniqueVehicleEvents;
}

function extractDatabaseName(uri: string): string | undefined {
	try {
		const url = new URL(uri);
		const pathname = url.pathname;
		if (pathname && pathname.length > 1) {
			return pathname.substring(1).split('?')[0];
		}
	}
	catch {
		// If URI parsing fails, return undefined
	}
	return undefined;
}

export async function fetchRidesData(
	config: FetchConfig,
	options: CliOptions,
): Promise<FetchedData> {
	if (!options.startDate || !options.endDate) {
		throw new Error('Both --start-date and --end-date are required');
	}

	const client = await connectToMongoDB(config.database);

	try {
		// Extract database name from URI or use configured database name
		let databaseName = config.database.database;
		if (!databaseName && config.database.uri) {
			databaseName = extractDatabaseName(config.database.uri);
		}
		if (!databaseName) {
			throw new Error('Database name not found. Please specify MONGO_DB in .env or include database name in DATABASE_URI');
		}

		const db = client.db(databaseName);

		const ridesCollection = db.collection<Ride>('rides');
		const hashedTripsCollection = db.collection<HashedTrip>('hashed_trips');
		const hashedShapesCollection = db.collection<HashedShape>('hashed_shapes');
		const vehicleEventsCollection = db.collection<SimplifiedVehicleEvent>('simplified_vehicle_events');

		// Fetch rides
		const rides = await fetchRides(
			ridesCollection,
			options.startDate,
			options.endDate,
			options.tripId,
			options.patternId,
			options.routeId,
		);

		if (rides.length === 0) {
			logger.warn('No rides found for the specified criteria');
			return {
				hashedShapes: [],
				hashedTrips: [],
				rides: [],
				vehicleEvents: [],
			};
		}

		// Collect unique IDs
		const hashedTripIds = Array.from(new Set(rides.map(ride => ride.hashed_trip_id)));
		const hashedShapeIds = Array.from(new Set(rides.map(ride => ride.hashed_shape_id)));

		logger.verbose(`Found ${hashedTripIds.length} unique hashed_trip_ids and ${hashedShapeIds.length} unique hashed_shape_ids`);

		// Fetch related data in parallel
		const [hashedTrips, hashedShapes] = await Promise.all([
			fetchHashedTrips(hashedTripsCollection, hashedTripIds),
			fetchHashedShapes(hashedShapesCollection, hashedShapeIds),
		]);

		// Fetch vehicle events if requested
		let vehicleEvents: SimplifiedVehicleEvent[] = [];
		if (options.includeVehicleEvents) {
			vehicleEvents = await fetchVehicleEvents(vehicleEventsCollection, rides);
		}

		return {
			hashedShapes,
			hashedTrips,
			rides,
			vehicleEvents,
		};
	}
	finally {
		await client.close();
		logger.verbose('MongoDB connection closed');
	}
}
