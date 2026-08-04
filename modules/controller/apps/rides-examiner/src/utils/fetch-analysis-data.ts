/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { Dates } from '@tmlmobilidade/dates';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride } from '@tmlmobilidade/go-types-operation';

/* * */

export async function fetchAnalysisData(rideData: Ride): Promise<AnalysisData> {
	//

	//
	// For this ride, fetch all the necessary data for analysis.
	// This includes static data, like hashed shapes and trips, and dynamic data,
	// like vehicle events and apex transactions. Request all data in parallel.

	const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

	//
	// Fetch data from LABDB.

	const hashedPathPromise = labDb.operation.hashedPaths.select('*', 'hashed_path_id = $1', { 1: rideData.hashed_path_id });
	const simplifiedApexLocationsNewPromise = labDb.simplifiedApex.locations.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const simplifiedApexOnBoardRefundsNewPromise = labDb.simplifiedApex.refunds.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const simplifiedApexOnBoardSalesNewPromise = labDb.simplifiedApex.sales.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const simplifiedApexValidationsNewPromise = labDb.simplifiedApex.validations.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const vehicleEventsPromise = labDb.operation.simplifiedVehicleEvents.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4 AND extra_trip_id IS NULL`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });

	const [
		hashedPathData,
		simplifiedApexLocationsData,
		simplifiedApexOnBoardRefundsData,
		simplifiedApexOnBoardSalesData,
		simplifiedApexValidationsData,
		vehicleEventsData,
	] = await Promise.all([
		hashedPathPromise,
		simplifiedApexLocationsNewPromise,
		simplifiedApexOnBoardRefundsNewPromise,
		simplifiedApexOnBoardSalesNewPromise,
		simplifiedApexValidationsNewPromise,
		vehicleEventsPromise,
	]);

	return {
		hashed_path: hashedPathData,
		ride: rideData,
		simplified_apex_locations: simplifiedApexLocationsData,
		simplified_apex_on_board_refunds: simplifiedApexOnBoardRefundsData,
		simplified_apex_on_board_sales: simplifiedApexOnBoardSalesData,
		simplified_apex_validations: simplifiedApexValidationsData,
		vehicle_events: vehicleEventsData,
	};
};
