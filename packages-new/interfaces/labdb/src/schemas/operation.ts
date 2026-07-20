/* * */

import { type ClickHouseTableSchema } from '@tmlmobilidade/go-clients-clickhouse';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/* * */

export const simplifiedVehicleEventTableSchema: ClickHouseTableSchema<SimplifiedVehicleEvent> = {
	_id: { type: 'String' },
	agency_id: { type: 'String' },
	bearing: { type: 'Nullable(Int64)' },
	created_at: { type: 'Int64' },
	current_status: { type: 'Nullable(String)' },
	driver_id: { type: 'Nullable(String)' },
	extra_trip_id: { type: 'Nullable(String)' },
	geohash: { default: 'geohashEncode(longitude, latitude, 7)', type: 'String' },
	latitude: { type: 'Float64' },
	longitude: { type: 'Float64' },
	odometer: { type: 'Nullable(Int64)' },
	operational_date: { type: 'Date' },
	received_at: { type: 'Int64' },
	speed: { type: 'Nullable(Int64)' },
	stop_id: { type: 'Nullable(String)' },
	trip_id: { type: 'String' },
	vehicle_id: { type: 'String' },
};
