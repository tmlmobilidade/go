/* * */

import { type ClickHouseTableSchema } from '@tmlmobilidade/go-clients-clickhouse';
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
