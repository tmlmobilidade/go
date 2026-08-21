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
	// Fetch data from LabDB in parallel.

	const hashedTripPromise = labDb.operation.hashedTrips.select('*', '_id = $1', { 1: rideData.hashed_trip_id });
	const simplifiedApexBankingTapsPromise = labDb.simplifiedApex.bankingTaps.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const simplifiedApexLocationsPromise = labDb.simplifiedApex.locations.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const simplifiedApexOnBoardRefundsPromise = labDb.simplifiedApex.refunds.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const simplifiedApexOnBoardSalesPromise = labDb.simplifiedApex.sales.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const simplifiedApexValidationsPromise = labDb.simplifiedApex.validations.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const vehicleEventsPromise = labDb.operation.simplifiedVehicleEvents.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4 AND extra_trip_id IS NULL`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });

	const [
		hashedTripData,
		simplifiedApexBankingTapsData,
		simplifiedApexLocationsData,
		simplifiedApexOnBoardRefundsData,
		simplifiedApexOnBoardSalesData,
		simplifiedApexValidationsData,
		vehicleEventsData,
	] = await Promise.all([
		hashedTripPromise,
		simplifiedApexBankingTapsPromise,
		simplifiedApexLocationsPromise,
		simplifiedApexOnBoardRefundsPromise,
		simplifiedApexOnBoardSalesPromise,
		simplifiedApexValidationsPromise,
		vehicleEventsPromise,
	]);

	return {
		apex_banking_taps: simplifiedApexBankingTapsData,
		apex_locations: simplifiedApexLocationsData,
		apex_refunds: simplifiedApexOnBoardRefundsData,
		apex_sales: simplifiedApexOnBoardSalesData,
		apex_validations: simplifiedApexValidationsData,
		hashed_trip: hashedTripData,
		ride: rideData,
		vehicle_events: vehicleEventsData,
	};
};
