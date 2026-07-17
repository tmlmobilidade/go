/* * */

import { type ClickHouseTableSchema } from '@tmlmobilidade/go-clients-clickhouse';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

export const simplifiedVehicleEventSchema: ClickHouseTableSchema<SimplifiedVehicleEvent> = {
	_id: { type: 'String' },
	agency_id: { type: 'String' },
	created_at: { type: 'Int64' },
	geohash: { default: 'geohashEncode(longitude, latitude, 7)', type: 'String' },
	latitude: { type: 'Float64' },
	longitude: { type: 'Float64' },
	operational_date: { type: 'Date' },
	received_at: { type: 'Int64' },
	trip_id: { type: 'String' },
	vehicle_id: { type: 'String' },
	// Optional Fields
	bearing: { type: 'Nullable(Int64)' },
	current_status: { type: 'Nullable(String)' },
	door: { type: 'Nullable(String)' },
	driver_id: { type: 'Nullable(String)' },
	extra_trip_id: { type: 'Nullable(String)' },
	odometer: { type: 'Nullable(Int64)' },
	pattern_id: { type: 'Nullable(String)' },
	speed: { type: 'Nullable(Int64)' },
	stop_id: { type: 'Nullable(String)' },
};
