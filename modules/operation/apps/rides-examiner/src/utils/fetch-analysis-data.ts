/* * */

import { type AnalysisData } from '@/types/analysis-data.js';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

export async function fetchAnalysisData(rideData: Ride): Promise<AnalysisData> {
	//

	//
	// For this ride, fetch all the necessary data for analysis.
	// This includes static data, like hashed shapes and trips, and dynamic data,
	// like vehicle events and apex transactions. Request all data in parallel.

	const standardWindowInterval = Dates.fromUnixMilliseconds(rideData.start_time_scheduled).std_window;

	const minOperationalDate = Dates.fromUnixMilliseconds(standardWindowInterval.start).operational_date_int;
	const maxOperationalDate = Dates.fromUnixMilliseconds(standardWindowInterval.end).operational_date_int;
	const operationalDateRange = OperationalDateIntSchema.array().parse(Array.from({ length: maxOperationalDate - minOperationalDate + 1 }, (_, i) => minOperationalDate + i));

	//
	// Fetch data from LabDB in parallel.
	const dynamicWhere = `operational_date IN (${operationalDateRange.join(',')}) AND created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`;
	const dynamicParams = { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id };

	const hashedTripPromise = labDb.operation.hashedTrips.select('*', '_id = $1', { 1: rideData.hashed_trip_id });
	const hashedShapePromise = labDb.operation.hashedShapes.select('*', '_id = $1', { 1: rideData.hashed_shape_id });
	const simplifiedApexBankingTapsPromise = labDb.simplifiedApex.bankingTaps.select('*', dynamicWhere, dynamicParams);
	const simplifiedApexLocationsPromise = labDb.simplifiedApex.locations.select('*', dynamicWhere, dynamicParams);
	const simplifiedApexOnBoardRefundsPromise = labDb.simplifiedApex.refunds.select('*', dynamicWhere, dynamicParams);
	const simplifiedApexOnBoardSalesPromise = labDb.simplifiedApex.sales.select('*', dynamicWhere, dynamicParams);
	const simplifiedApexValidationsPromise = labDb.simplifiedApex.validations.select('*', dynamicWhere, dynamicParams);
	const vehicleEventsPromise = labDb.operation.simplifiedVehicleEvents.select('*', `${dynamicWhere} AND extra_trip_id IS NULL`, dynamicParams);

	const [
		hashedTripData,
		hashedShapeData,
		simplifiedApexBankingTapsData,
		simplifiedApexLocationsData,
		simplifiedApexOnBoardRefundsData,
		simplifiedApexOnBoardSalesData,
		simplifiedApexValidationsData,
		vehicleEventsData,
	] = await Promise.all([
		hashedTripPromise,
		hashedShapePromise,
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
		hashed_shape: hashedShapeData?.length > 0 ? hashedShapeData[0] : null,
		hashed_trip: hashedTripData,
		ride: rideData,
		vehicle_events: vehicleEventsData,
	};
};
