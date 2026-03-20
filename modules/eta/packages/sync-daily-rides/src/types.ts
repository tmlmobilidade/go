/* * */

import { ClickHouseColumn } from '@tmlmobilidade/clickhouse';
import { HashedTripWaypoint, Ride } from '@tmlmobilidade/types';

/* * */

export const dailyRideTableSchema: ClickHouseColumn<Partial<Ride>>[] = [
	{ name: '_id', type: 'String' },
	{ name: 'hashed_trip_id', type: 'String' },
	{ name: 'hashed_shape_id', type: 'String' },
	{ name: 'line_id', type: 'UInt16' },
	{ name: 'operational_date', type: 'String' },
	{ name: 'start_time_scheduled', type: 'UInt64' },
	{ name: 'end_time_scheduled', type: 'UInt64' },
	{ name: 'start_time_observed', type: 'UInt64' },
	{ name: 'headsign', type: 'String' },
];

export type DailyTripWaypoint = HashedTripWaypoint & { hashed_trip_id: string };

export const dailyTripWaypointTableSchema: ClickHouseColumn<DailyTripWaypoint>[] = [
	{ name: 'hashed_trip_id', type: 'String' },
	{ name: 'arrival_time', type: 'String' },
	{ name: 'departure_time', type: 'String' },
	{ name: 'drop_off_type', type: 'UInt8' },
	{ name: 'pickup_type', type: 'UInt8' },
	{ name: 'shape_dist_traveled', type: 'Float64' },
	{ name: 'stop_id', type: 'String' },
	{ name: 'stop_lat', type: 'Float64' },
	{ name: 'stop_lon', type: 'Float64' },
	{ name: 'stop_name', type: 'String' },
	{ name: 'stop_sequence', type: 'UInt16' },
	{ name: 'timepoint', type: 'UInt8' },
];
