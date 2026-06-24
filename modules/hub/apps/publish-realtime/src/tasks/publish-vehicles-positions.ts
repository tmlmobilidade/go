/* * */

import { apiCache, simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HubPlan, type HubVehiclePosition, HubVehiclePositionSchema, validateCalendarDate } from '@tmlmobilidade/types';
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

	const vehiclePositions: HubVehiclePosition[] = [];

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
				if (!associatedRide && vehicleEventData.agency_id !== '3') throw new Error(`No ride found for trip ID: ${vehicleEventData.trip_id} and agency ID: ${vehicleEventData.agency_id} in the standard window: ${standardWindow.start} to ${standardWindow.end}`);
				// Parse the vehicle position data
				const vehiclePositionData: HubVehiclePosition = {
					...vehicleEventData,
					calendar_date: validateCalendarDate(vehicleEventData.operational_date),
					geohash: vehicleEventData.geohash ?? null,
					line_id: getPublicLineId(vehicleEventData.agency_id, String(associatedRide?.line_id || '-')),
					pattern_id: getPublicPatternId(vehicleEventData.agency_id, String(associatedRide?.pattern_id ?? '-')),
					ride_id: associatedRide?._id ?? '-',
					trip_id: getPublicTripId(activePlanIdForAgency ?? '-', vehicleEventData.agency_id, vehicleEventData.trip_id),
					vehicle_id: getPublicVehicleId(vehicleEventData.agency_id, vehicleEventData.vehicle_id),
				};
				const parsedVehiclePosition = HubVehiclePositionSchema.safeParse(vehiclePositionData);
				if (!parsedVehiclePosition.success) throw new Error(`Error parsing vehicle position ID: ${vehicleEventData._id}: ${parsedVehiclePosition.error.message}`);
				// Add the vehicle position to the list
				vehiclePositions.push(parsedVehiclePosition.data);
			} catch (error) {
				Logger.error({ message: `Error parsing vehicle position ID: ${vehicleEventData._id}: ${(error as Error).message}` });
			}
		}),
	);

	Logger.info({ message: `Retrieved ${vehiclePositions.length} latest vehicles positions...` });

	//
	// Save the result in API Cache

	await apiCache.set('hub:v1:realtime:vehicles:positions:json', JSON.stringify(vehiclePositions));

	Logger.success(`Finished publishing latest vehicles positions (${globalTimer.get()})`);

	//
};
