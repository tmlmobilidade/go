/* * */

import { simplifiedApexLocationsNew, simplifiedApexOnBoardRefundsNew, simplifiedApexOnBoardSalesNew, simplifiedApexValidationsNew, simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { type SimplifiedApexLocation, type SimplifiedApexOnBoardRefund, type SimplifiedApexOnBoardSale, type SimplifiedApexValidation } from '@tmlmobilidade/go-types-apex';
import { hashedShapes, hashedTrips, simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations, simplifiedVehicleEvents } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HashedShape, type HashedTrip, type Ride, type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

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

	const fetchAnalysisDataTimer = new Timer();

	const standardWindowInterval = Dates.fromUnixTimestamp(rideData.start_time_scheduled).std_window;

	//
	// Fetch static data

	const hashedShapePromise = hashedShapes.findById(rideData.hashed_shape_id);
	const hashedTripPromise = hashedTrips.findById(rideData.hashed_trip_id);

	//
	// Fetch dynamic data. For agencies 41, 42, 43, 44, fetch data from the legacy MongoDB interfaces.
	// For other agencies, fetch data from the Clickhouse interfaces.

	if (['41', '42', '43', '44'].includes(rideData.agency_id)) {
		const simplifiedApexLocationsPromise = simplifiedApexLocations.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
		const simplifiedApexOnBoardRefundsPromise = simplifiedApexOnBoardRefunds.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
		const simplifiedApexOnBoardSalesPromise = simplifiedApexOnBoardSales.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
		const simplifiedApexValidationsPromise = simplifiedApexValidations.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, trip_id: rideData.trip_id });
		const vehicleEventsPromise = simplifiedVehicleEvents.findMany({ created_at: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end }, extra_trip_id: null, trip_id: rideData.trip_id });

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
			simplifiedApexLocationsPromise,
			simplifiedApexOnBoardRefundsPromise,
			simplifiedApexOnBoardSalesPromise,
			simplifiedApexValidationsPromise,
			vehicleEventsPromise,
		]);

		const fetchAnalysisDataTime = fetchAnalysisDataTimer.get();

		Logger.info({ message: `Fetched analysis data from legacy MongoDB interfaces in ${fetchAnalysisDataTime}ms` });

		return {
			hashed_shape: hashedShapeData,
			hashed_trip: hashedTripData,
			simplified_apex_locations: simplifiedApexLocationsData,
			simplified_apex_on_board_refunds: simplifiedApexOnBoardRefundsData,
			simplified_apex_on_board_sales: simplifiedApexOnBoardSalesData,
			simplified_apex_validations: simplifiedApexValidationsData,
			vehicle_events: vehicleEventsData,
		};
	}

	//
	// For other agencies, fetch data from the Clickhouse interfaces.

	const simplifiedApexLocationsNewPromise = simplifiedApexLocationsNew.select('*', `created_at >= '${standardWindowInterval.start}' AND created_at <= '${standardWindowInterval.end}' AND trip_id = '${rideData.trip_id}'`);
	const simplifiedApexOnBoardRefundsNewPromise = simplifiedApexOnBoardRefundsNew.select('*', `created_at >= '${standardWindowInterval.start}' AND created_at <= '${standardWindowInterval.end}' AND trip_id = '${rideData.trip_id}'`);
	const simplifiedApexOnBoardSalesNewPromise = simplifiedApexOnBoardSalesNew.select('*', `created_at >= '${standardWindowInterval.start}' AND created_at <= '${standardWindowInterval.end}' AND trip_id = '${rideData.trip_id}'`);
	const simplifiedApexValidationsNewPromise = simplifiedApexValidationsNew.select('*', `created_at >= '${standardWindowInterval.start}' AND created_at <= '${standardWindowInterval.end}' AND trip_id = '${rideData.trip_id}'`);
	const vehicleEventsNewPromise = simplifiedVehicleEventsNew.select('*', `created_at >= '${standardWindowInterval.start}' AND created_at <= '${standardWindowInterval.end}' AND extra_trip_id = null AND trip_id = '${rideData.trip_id}'`);

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

	const fetchAnalysisDataTime = fetchAnalysisDataTimer.get();

	Logger.info({ message: `Fetched analysis data from legacy MongoDB interfaces in ${fetchAnalysisDataTime}ms` });

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
