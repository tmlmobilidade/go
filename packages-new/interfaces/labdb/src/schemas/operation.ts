/* * */

import { type ClickHouseTableSchema } from '@tmlmobilidade/go-clients-clickhouse';
import { type Ride, type RideAnalysisAtLeastOneVehicleEventOnFirstStop, type RideAnalysisBase } from '@tmlmobilidade/go-types-operation';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export const simplifiedVehicleEventTableSchema: ClickHouseTableSchema<SimplifiedVehicleEvent> = {
	_id: { type: 'String' },
	agency_id: { type: 'LowCardinality(String)' },
	bearing: { type: 'Nullable(UInt16) CODEC(T64, ZSTD)' },
	created_at: { type: 'Int64 CODEC(DoubleDelta, ZSTD)' },
	current_status: { type: 'LowCardinality(Nullable(String))' },
	driver_id: { type: 'LowCardinality(Nullable(String))' },
	extra_trip_id: { type: 'Nullable(String)' },
	geohash: { materialized: 'geohashEncode(longitude, latitude, 7)', type: 'FixedString(7)' },
	latitude: { type: 'Float32 CODEC(Gorilla, ZSTD)' },
	longitude: { type: 'Float32 CODEC(Gorilla, ZSTD)' },
	odometer: { type: 'Nullable(UInt32)' },
	operational_date: { type: 'UInt32' },
	received_at: { type: 'Int64 CODEC(DoubleDelta, ZSTD)' },
	speed: { type: 'Nullable(UInt8) CODEC(T64, ZSTD)' },
	stop_id: { type: 'LowCardinality(Nullable(String))' },
	trip_id: { type: 'String' },
	vehicle_id: { type: 'LowCardinality(String)' },
};

/* * */

const rideAnalysisBaseTableSchema: ClickHouseTableSchema<RideAnalysisBase> = {
	is_accepted: { type: 'Bool' },
	processing_status: { type: 'LowCardinality(String)' },
	reason: { type: 'LowCardinality(Nullable(String))' },
	remarks: { type: 'Nullable(String) CODEC(ZSTD)' },
	ride_id: { type: 'String' },
	updated_at: { type: 'Int64 CODEC(DoubleDelta, ZSTD)' },
};

/* * */

export const rideAnalysisAtLeastOneVehicleEventOnFirstStopTableSchema: ClickHouseTableSchema<RideAnalysisAtLeastOneVehicleEventOnFirstStop> = {
	...rideAnalysisBaseTableSchema,
	value: { type: 'Nullable(UInt8) CODEC(T64, ZSTD)' },
};

/* * */

export const ridesTableSchema: ClickHouseTableSchema<Ride> = {
	_id: { type: 'String' },
	agency_code: { type: 'LowCardinality(String)' },
	agency_id: { type: 'LowCardinality(String)' },
	apex_banking_taps_amount: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	apex_banking_taps_qty: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	apex_locations_qty: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	apex_refunds_amount: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	apex_refunds_qty: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	apex_sales_amount: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	apex_sales_qty: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	apex_validations_qty: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	direction_id: { type: 'UInt8' },
	driver_ids: { type: 'Array(LowCardinality(String))' },
	end_time_observed: { type: 'Nullable(Int64) CODEC(DoubleDelta, ZSTD)' },
	end_time_scheduled: { type: 'Int64 CODEC(DoubleDelta, ZSTD)' },
	extension_observed: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	extension_scheduled: { type: 'UInt32 CODEC(T64, ZSTD)' },
	hashed_path_id: { type: 'LowCardinality(String)' },
	headsign: { type: 'LowCardinality(String)' },
	operational_date: { type: 'UInt32' },
	passengers_estimated: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	passengers_observed: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	passengers_observed_banking_taps_amount: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	passengers_observed_banking_taps_qty: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	passengers_observed_prepaid_amount: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	passengers_observed_prepaid_qty: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	passengers_observed_sales_amount: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	passengers_observed_sales_qty: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	passengers_observed_subscription_qty: { type: 'Nullable(UInt32) CODEC(T64, ZSTD)' },
	plan_id: { type: 'LowCardinality(String)' },
	processing_status: { type: 'LowCardinality(String)' },
	route_color: { type: 'FixedString(6)' },
	route_id: { type: 'LowCardinality(String)' },
	route_long_name: { type: 'LowCardinality(String)' },
	route_short_name: { type: 'LowCardinality(String)' },
	route_text_color: { type: 'FixedString(6)' },
	seen_first_at: { type: 'Nullable(Int64) CODEC(DoubleDelta, ZSTD)' },
	seen_last_at: { type: 'Nullable(Int64) CODEC(DoubleDelta, ZSTD)' },
	shape_id: { type: 'LowCardinality(String)' },
	shape_polyline: { type: 'String CODEC(ZSTD)' },
	start_time_observed: { type: 'Nullable(Int64) CODEC(DoubleDelta, ZSTD)' },
	start_time_scheduled: { type: 'Int64 CODEC(DoubleDelta, ZSTD)' },
	trip_id: { type: 'LowCardinality(String)' },
	updated_at: { type: 'Int64 CODEC(DoubleDelta, ZSTD)' },
	vehicle_ids: { type: 'Array(LowCardinality(String))' },
};
