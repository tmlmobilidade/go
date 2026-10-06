/* * */

import { getOrganizationAgencyIds, getOrganizationCacheKey, getQualifiedPatternId, getQualifiedRouteId, getQualifiedShapeId, getQualifiedTripId, getQualifiedVehicleId } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type GtfsRtFeedEntity, GtfsRtFeedEntitySchema, type GtfsRtFeedMessage, GtfsRtFeedMessageSchema } from '@tmlmobilidade/go-types-gtfs-rt';
import { type HubV1ApiVehiclePosition, HubV1ApiVehiclePositionSchema } from '@tmlmobilidade/go-types-hub';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { DegreesSchema, OperationalDateIntSchema, toCalendarDate, UnixSecondsSchema } from '@tmlmobilidade/go-types-shared';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { calculateBearingInDegrees, getDistanceBetweenPositions } from '@tmlmobilidade/go-utils-geo';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

import { getVehiclesMetadataMap } from '../utils/get-vehicles-metadata-map.js';

/* * */

type QueryResult =
  Pick<Ride, 'direction_id' | 'operational_date' | 'plan_id' | 'route_id' | 'route_short_name' | 'shape_id'>
  & Pick<SimplifiedVehicleEvent,
  | '_id'
  | 'agency_id'
  | 'bearing'
  | 'created_at'
  | 'current_status'
  | 'geohash'
  | 'latitude'
  | 'longitude'
  | 'received_at'
  | 'speed'
  | 'stop_id'
  | 'trip_id'
  | 'vehicle_id'
  >
  & { ride_id: string };

/* * */

export async function publishVehiclesPositions() {
	//

	Logger.title('Publishing latest vehicles positions...');

	const timer = new Timer();
	const [organizations, agencies] = await Promise.all([goDb.core.organizations.findMany(), goDb.core.agencies.findMany()]);
	const agencyIds = [...new Set(organizations.flatMap(organization => getOrganizationAgencyIds(organization, agencies, 'positions_enabled')))];

	//
	// Retrieve active plans from local cache

	const metadataTimer = new Timer();

	const vehiclesMetadata = await getVehiclesMetadataMap();

	Logger.info({ message: `Retrieved ${vehiclesMetadata.size} vehicle metadata in ${metadataTimer.get()}` });

	//
	// Retrieve the two latest vehicle positions for each vehicle,
	// and create a map by vehicle ID

	const queryTimer = new Timer();

	const latestVehiclePositions = agencyIds.length
		? await labDb.queryFromFile<QueryResult>(sqlPath('hub', 'publish-vehicles/select-vehicle-positions.sql'), { agency_ids: agencyIds })
		: [];

	const vehiclePositionsMap = new Map<string, QueryResult[]>();

	for (const position of latestVehiclePositions) {
		const key = `${position.agency_id}:${position.vehicle_id}`;
		if (!vehiclePositionsMap.has(key)) vehiclePositionsMap.set(key, []);
		vehiclePositionsMap.get(key)?.push(position);
	}

	Logger.info({ message: `Got ${latestVehiclePositions.length} vehicle positions for ${vehiclePositionsMap.size} vehicles from LabDB (${queryTimer.get()})` });

	//
	// Prepare each vehicle position for publication,
	// adding the bearing to the position if two positions are available
	// and if the current position does not already have a bearing value.

	const parseTimer = new Timer();

	const failedAgencyIds = new Set<string>();
	const hubVehiclePositionsJson: HubV1ApiVehiclePosition[] = [];
	const hubVehiclePositionsGtfsRt: { agencyId: string, entity: GtfsRtFeedEntity }[] = [];

	for (const [key, vehiclePositions] of vehiclePositionsMap.entries() as IterableIterator<[string, QueryResult[]]>) {
		//

		let currentPosition: QueryResult;
		let previousPosition: null | QueryResult;

		if (vehiclePositions.length === 2) {
			currentPosition = vehiclePositions[0];
			previousPosition = vehiclePositions[1];
		} else {
			currentPosition = vehiclePositions[0];
			previousPosition = null;
		}

		try {
			//
			// Calculate the bearing if two positions are available
			// and if the current position does not already have a bearing value.

			let bearingValue: null | number = currentPosition.bearing;
			let bearingMethod: HubV1ApiVehiclePosition['bearing_method'] = currentPosition.bearing ? 'measured' : 'skipped';

			if (!currentPosition.bearing && previousPosition) {
				const distanceBetweenPositions = getDistanceBetweenPositions([currentPosition.longitude, currentPosition.latitude], [previousPosition.longitude, previousPosition.latitude]);
				if (distanceBetweenPositions < 50 && previousPosition.bearing) {
					// Accept the previous position's bearing value if the distance
					// between the positions is less than 50 meters.
					bearingValue = previousPosition.bearing;
					bearingMethod = 'kept_prev_value';
				} else {
					// Otherwise, calculate the bearing between the positions.
					const result = calculateBearingInDegrees([currentPosition.longitude, currentPosition.latitude], [previousPosition.longitude, previousPosition.latitude]);
					if (result) {
						bearingValue = result;
						bearingMethod = 'inferred';
					}
				}
			}

			//
			// Retrieve the vehicle metadata

			const vehicleMetadata = vehiclesMetadata.get(key);

			//
			// Transform the current position into
			// the Hub V1 API Vehicle Position format

			const hubV1Json = HubV1ApiVehiclePositionSchema.safeParse({
				_id: currentPosition._id,
				agency_id: currentPosition.agency_id,
				bearing: bearingValue ? DegreesSchema.parse(bearingValue) : undefined,
				bearing_method: bearingMethod,
				calendar_date: toCalendarDate(currentPosition.operational_date),
				created_at: currentPosition.created_at,
				current_status: currentPosition.current_status,
				direction_id: currentPosition.direction_id,
				geohash: currentPosition.geohash,
				latitude: currentPosition.latitude,
				license_plate: vehicleMetadata?.license_plate,
				longitude: currentPosition.longitude,
				operational_date: currentPosition.operational_date,
				pattern_id: getQualifiedPatternId(currentPosition.agency_id, currentPosition.shape_id),
				received_at: currentPosition.received_at,
				ride_id: currentPosition.ride_id,
				route_id: getQualifiedRouteId(currentPosition.agency_id, currentPosition.route_id),
				route_short_name: currentPosition.route_short_name,
				shape_id: getQualifiedShapeId(currentPosition.plan_id, currentPosition.agency_id, currentPosition.shape_id),
				speed: currentPosition.speed,
				stop_id: currentPosition.stop_id,
				trip_id: getQualifiedTripId(currentPosition.plan_id, currentPosition.agency_id, currentPosition.trip_id),
				vehicle_id: getQualifiedVehicleId(currentPosition.agency_id, currentPosition.vehicle_id),
			});

			if (!hubV1Json.success) throw new Error(`Failed to parse Hub V1 API Vehicle Position: ${hubV1Json.error.message}`);

			hubVehiclePositionsJson.push(hubV1Json.data);

			//
			// Transform the current position into
			// the GTFS-RT Vehicle Position format

			const hubV1GtfsRt = GtfsRtFeedEntitySchema.parse({
				id: currentPosition._id,
				vehicle: {
					current_status: currentPosition.current_status,
					position: {
						bearing: currentPosition.bearing,
						latitude: currentPosition.latitude,
						longitude: currentPosition.longitude,
						speed: currentPosition.speed,
					},
					stop_id: currentPosition.stop_id,
					timestamp: UnixSecondsSchema.parse(currentPosition.created_at / 1000),
					trip: {
						direction_id: currentPosition.direction_id,
						route_id: getQualifiedRouteId(currentPosition.agency_id, currentPosition.route_id),
						schedule_relationship: 'SCHEDULED',
						start_date: OperationalDateIntSchema.parse(currentPosition.operational_date),
						trip_id: getQualifiedTripId(currentPosition.plan_id, currentPosition.agency_id, currentPosition.trip_id),
					},
					vehicle: {
						id: getQualifiedVehicleId(currentPosition.agency_id, currentPosition.vehicle_id),
						label: vehicleMetadata?.license_plate,
						license_plate: vehicleMetadata?.license_plate,
						wheelchair_accessible: vehicleMetadata?.wheelchair ? 'WHEELCHAIR_ACCESSIBLE' : 'UNKNOWN',
					},
				},
			});

			hubVehiclePositionsGtfsRt.push({ agencyId: currentPosition.agency_id, entity: hubV1GtfsRt });
		} catch (error) {
			failedAgencyIds.add(currentPosition.agency_id);
			Logger.error({ error, message: `Error transforming vehicle positions for agency ${currentPosition.agency_id}.` });
		}
	}

	//
	// Publish each organization's JSON and GTFS-RT positions independently.

	for (const organization of organizations) {
		try {
			const enabledAgencyIds = getOrganizationAgencyIds(organization, agencies, 'positions_enabled');
			if (enabledAgencyIds.some(agencyId => failedAgencyIds.has(agencyId))) throw new Error('Vehicle positions could not be transformed for a member agency');
			const positions = hubVehiclePositionsJson.filter(position => enabledAgencyIds.includes(position.agency_id));
			const gtfsRtFeedMessage: GtfsRtFeedMessage = {
				entity: hubVehiclePositionsGtfsRt.filter(item => enabledAgencyIds.includes(item.agencyId)).map(item => item.entity),
				header: {
					gtfs_realtime_version: '2.0',
					incrementality: 'FULL_DATASET',
					timestamp: Dates.now('utc').unix_seconds,
				},
			};
			const validatedFeed = GtfsRtFeedMessageSchema.parse(gtfsRtFeedMessage);
			await cacheDb.setNew(getOrganizationCacheKey(organization._id, 'vehicles:positions:json'), positions, 600);
			await cacheDb.set(getOrganizationCacheKey(organization._id, 'vehicles:positions:gtfs'), JSON.stringify(validatedFeed), 600);
		} catch (error) {
			Logger.error({ error, message: `Error publishing vehicle positions for organization ${organization._id}.` });
		}
	}

	Logger.info({ message: `Parsed vehicle positions in ${parseTimer.get()}. Run complete in ${timer.get()}` });
};
