/* * */

import { Dates } from '@tmlmobilidade/dates';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';
import { type HashedShape, type HashedTrip, type Ride } from '@tmlmobilidade/types';

/* * */

interface FetchAnalysisDataReturnType {
	hashed_shape: HashedShape
	hashed_trip: HashedTrip
	simplified_apex_locations: SimplifiedApexLocation[]
	simplified_apex_on_board_refunds: SimplifiedApexOnBoardRefund[]
	simplified_apex_on_board_sales: SimplifiedApexOnBoardSale[]
	simplified_apex_validations: SimplifiedApexValidation[]
	vehicle_events: SimplifiedVehicleEvent[]
}

/* * */

export async function fetchAnalysisData(rideData: Ride): Promise<FetchAnalysisDataReturnType> {
	//

	//
	// For this ride, fetch all the necessary data for analysis.
	// This includes static data, like hashed shapes and trips, and dynamic data,
	// like vehicle events and apex transactions. Request all data in parallel.

	const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

	//
	// Fetch static data

	const hashedShapePromise = goDb.operation.hashedShapes.findById(rideData.hashed_shape_id);
	const hashedTripPromise = goDb.operation.hashedTrips.findById(rideData.hashed_trip_id);

	//
	// Fetch data from LABDB.

	const simplifiedApexLocationsNewPromise = labDb.simplifiedApex.locations.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const simplifiedApexOnBoardRefundsNewPromise = labDb.simplifiedApex.refunds.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const simplifiedApexOnBoardSalesNewPromise = labDb.simplifiedApex.sales.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const simplifiedApexValidationsNewPromise = labDb.simplifiedApex.validations.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });
	const vehicleEventsNewPromise = labDb.operation.vehicleEvents.select('*', `created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4 AND extra_trip_id IS NULL`, { 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id });

	const [
		hashedShapeData,
		hashedTripData,
		simplifiedApexLocationsData,
		simplifiedApexOnBoardRefundsData,
		simplifiedApexOnBoardSalesData,
		simplifiedApexValidationsData,
		vehicleEventsData,
	] = await Promise.all([
		hashedShapePromise,
		hashedTripPromise,
		simplifiedApexLocationsNewPromise,
		simplifiedApexOnBoardRefundsNewPromise,
		simplifiedApexOnBoardSalesNewPromise,
		simplifiedApexValidationsNewPromise,
		vehicleEventsNewPromise,
	]);

	return {
		hashed_shape: hashedShapeData,
		hashed_trip: hashedTripData,
		simplified_apex_locations: simplifiedApexLocationsData,
		simplified_apex_on_board_refunds: simplifiedApexOnBoardRefundsData,
		simplified_apex_on_board_sales: simplifiedApexOnBoardSalesData,
		simplified_apex_validations: simplifiedApexValidationsData,
		vehicle_events: vehicleEventsData,
	};

	//
};
