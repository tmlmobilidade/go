/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type Ride } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

import { type AnalysisData } from '../types/analysis-data.js';

/* * */

export async function fetchAnalysisData(rideData: Ride): Promise<AnalysisData> {
	//

	//
	// For this ride, fetch all the necessary data for analysis.
	// This includes static data, like hashed shapes and trips, and dynamic data,
	// like vehicle events and apex transactions. Request all data in parallel.

	const standardWindowInterval = Dates.fromUnixMilliseconds(rideData.start_time_scheduled).std_window;

	//
	// Fetch data from LabDB in parallel.

	const simplifiedApexBankingTapsPromise = labDb.simplifiedApex.bankingTaps.select(
		'group_dimension, mac_ase_counter_value, mac_sam_serial_number, vehicle_id',
		`created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`,
		{ 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id },
	);

	const simplifiedApexLocationsPromise = labDb.simplifiedApex.locations.select(
		'mac_ase_counter_value, mac_sam_serial_number, stop_id, vehicle_id',
		`created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`,
		{ 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id },
	);

	const simplifiedApexOnBoardRefundsPromise = labDb.simplifiedApex.refunds.select(
		'mac_ase_counter_value, mac_sam_serial_number, price, vehicle_id',
		`created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`,
		{ 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id },
	);

	const simplifiedApexOnBoardSalesPromise = labDb.simplifiedApex.sales.select(
		'is_passenger, mac_ase_counter_value, mac_sam_serial_number, price, vehicle_id',
		`created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`,
		{ 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id },
	);

	const simplifiedApexValidationsPromise = labDb.simplifiedApex.validations.select(
		'category, created_at, is_passenger, mac_ase_counter_value, mac_sam_serial_number, units_qty, vehicle_id',
		`created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4`,
		{ 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id },
	);

	const hashedShapePromise = labDb.operation.hashedShapes.select(
		'shape_polyline',
		'_id = $1',
		{ 1: rideData.hashed_shape_id },
	);

	const hashedTripPromise = labDb.operation.hashedTrips.select(
		'stop_id, stop_lat, stop_lon, stop_sequence',
		'_id = $1',
		{ 1: rideData.hashed_trip_id },
	);

	const vehicleEventsPromise = labDb.operation.simplifiedVehicleEvents.select(
		'created_at, driver_id, latitude, longitude, odometer, received_at, stop_id, vehicle_id',
		`created_at >= $1 AND created_at <= $2 AND agency_id = $3 AND trip_id = $4 AND extra_trip_id IS NULL`,
		{ 1: standardWindowInterval.start, 2: standardWindowInterval.end, 3: rideData.agency_id, 4: rideData.trip_id },
	);

	const [
		simplifiedApexBankingTapsData,
		simplifiedApexLocationsData,
		simplifiedApexOnBoardRefundsData,
		simplifiedApexOnBoardSalesData,
		simplifiedApexValidationsData,
		hashedShapeData,
		hashedTripData,
		vehicleEventsData,
	] = await Promise.all([
		simplifiedApexBankingTapsPromise,
		simplifiedApexLocationsPromise,
		simplifiedApexOnBoardRefundsPromise,
		simplifiedApexOnBoardSalesPromise,
		simplifiedApexValidationsPromise,
		hashedShapePromise,
		hashedTripPromise,
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
