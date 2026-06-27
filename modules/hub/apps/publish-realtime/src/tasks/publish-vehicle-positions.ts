/* * */

import { apiCache, simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { validateGtfsDate } from '@tmlmobilidade/go-types-gtfs';
import { type GtfsRtFeedEntity, type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { type HubPlan, HubVehiclePosition, HubVehiclePositionSchema } from '@tmlmobilidade/go-types-public-info';
import { OperationalDateInt, validateCalendarDate, validateOperationalDateInt } from '@tmlmobilidade/go-types-shared';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { getPublicLineId, getPublicPatternId, getPublicTripId, getPublicVehicleId } from '@tmlmobilidade/utils';

/* * */

export async function publishVehiclesPositions() {
	//

	Logger.title('Publishing latest vehicles positions...');

	const globalTimer = new Timer();

	//
	// Connect to databases

	const ridesCollection = await rides.getCollection();

	//
	// Retrieve active plans from the database

	const approvedPlans = await apiCache.get('hub:v1:plans:approved:json');
	if (!approvedPlans) throw new Error('No approved plans found in API Cache');

	const approvedPlansData: HubPlan[] = JSON.parse(approvedPlans);
	const activePlansData = approvedPlansData.filter(plan => plan.is_active);
	if (!activePlansData.length) throw new Error('No active plans found in API Cache');

	const activePlansIdsMap: Record<string, string> = Object.fromEntries(activePlansData.map(plan => [plan.agency_id, plan._id]));

	//
	// Retrieve active alerts from the database

	const latestVehicleEventsData = await simplifiedVehicleEventsNew.getPositions();

	const vehiclePositionsJson: HubVehiclePosition[] = [];

	await Promise.all(
		latestVehicleEventsData.map(async (vehicleEventData) => {
			try {
				// Skip if vehicle position does not have a trip_id
				if (!vehicleEventData.trip_id) return;
				// Check if there is an active plan for the agency
				const activePlanIdForAgency = activePlansIdsMap[vehicleEventData.agency_id];
				if (!activePlanIdForAgency && vehicleEventData.agency_id !== '3') throw new Error(`No active plan found for agency ID: ${vehicleEventData.agency_id}`);
				// Fetch the corresponding ride from the database
				const standardWindow = Dates.fromUnixTimestamp(vehicleEventData.created_at).std_window;
				const associatedRide = await ridesCollection.findOne({ agency_id: vehicleEventData.agency_id, start_time_scheduled: { $gte: standardWindow.start, $lte: standardWindow.end }, trip_id: vehicleEventData.trip_id }, { projection: { _id: 1, line_id: 1, pattern_id: 1 } });
				if (!associatedRide && vehicleEventData.agency_id !== '2') throw new Error(`No ride found for trip ID: ${vehicleEventData.trip_id} and agency ID: ${vehicleEventData.agency_id} in the standard window: ${standardWindow.start} to ${standardWindow.end}`);
				// Prepare the operational date for this positions
				let operationalDate: OperationalDateInt;
				if (associatedRide?.operational_date) operationalDate = validateOperationalDateInt(associatedRide.operational_date);
				else operationalDate = Dates.now('Europe/Lisbon').operational_date_int;
				// Parse the vehicle position data
				const vehiclePositionData: HubVehiclePosition = {
					...vehicleEventData,
					calendar_date: validateCalendarDate(vehicleEventData.operational_date),
					geohash: vehicleEventData.geohash ?? null,
					line_id: getPublicLineId(vehicleEventData.agency_id, String(associatedRide?.line_id || '-')),
					operational_date: operationalDate,
					pattern_id: getPublicPatternId(vehicleEventData.agency_id, String(associatedRide?.pattern_id ?? '-')),
					ride_id: associatedRide?._id,
					route_id: associatedRide?._id,
					trip_id: getPublicTripId(activePlanIdForAgency ?? '-', vehicleEventData.agency_id, vehicleEventData.trip_id),
					vehicle_id: getPublicVehicleId(vehicleEventData.agency_id, vehicleEventData.vehicle_id),
				};
				const parsedVehiclePosition = HubVehiclePositionSchema.safeParse(vehiclePositionData);
				if (!parsedVehiclePosition.success) throw new Error(`Error parsing vehicle position ID: ${vehicleEventData._id}: ${parsedVehiclePosition.error.message}`);
				// Add the vehicle position to the list
				vehiclePositionsJson.push(parsedVehiclePosition.data);
			} catch (error) {
				Logger.error({ message: `Error parsing vehicle position ID: ${vehicleEventData._id}: ${(error as Error).message}` });
			}
		}),
	);

	Logger.info({ message: `Retrieved ${vehiclePositionsJson.length} latest vehicles positions...` });

	//
	// Save the result in API Cache

	await apiCache.set('hub:v1:realtime:vehicles:positions:json', JSON.stringify(vehiclePositionsJson));

	Logger.success(`Finished publishing latest vehicles positions (${globalTimer.get()})`);

	//
	// Convert the vehicle positions to GTFS-RT feed entities

	const vehiclePositionsGtfs: GtfsRtFeedMessage = {
		entity: [],
		header: {
			gtfs_realtime_version: '2.0',
			incrementality: 'FULL_DATASET',
			timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
		},
	};

	vehiclePositionsGtfs.entity = vehiclePositionsJson
		.filter((vehiclePosition) => {
			if (!vehiclePosition.ride_id) return false;
			return true;
		})
		.map((vehiclePosition) => {
			const entity: GtfsRtFeedEntity = {
				id: vehiclePosition._id,
				vehicle: {
					current_status: vehiclePosition.current_status,
					position: {
						bearing: vehiclePosition.bearing,
						latitude: vehiclePosition.latitude,
						longitude: vehiclePosition.longitude,
						speed: vehiclePosition.speed,
					},
					stop_id: vehiclePosition.stop_id,
					timestamp: vehiclePosition.created_at,
					trip: {
						route_id: vehiclePosition.route_id,
						schedule_relationship: 'SCHEDULED',
						start_date: validateGtfsDate(vehiclePosition.operational_date),
						trip_id: vehiclePosition.trip_id,
					},
					vehicle: {
						id: vehiclePosition.vehicle_id,
						wheelchair_accessible: 'UNKNOWN',
					},
				},
			};
			return entity;
		});

	await apiCache.set('hub:v1:realtime:vehicles:positions:gtfs', JSON.stringify(vehiclePositionsGtfs));

	Logger.success(`Finished publishing latest vehicles positions GTFS-RT (${globalTimer.get()})`);

	//
};
