import { ClickHouseColumn } from '@tmlmobilidade/clickhouse';
import { Ride } from '@tmlmobilidade/types';

export interface EtaVehicleEvent {
	_id: string
	agency_id: string
	created_at: number
	geohash: string
	hashed_shape_id: string
	latitude: number
	line_id: number
	longitude: number
	ride_id: string
	vehicle_id: string
}

export const rideProjection: Partial<Record<keyof Ride, 0 | 1>> = {
	_id: 1,
	end_time_observed: 1,
	hashed_shape_id: 1,
	line_id: 1,
	operational_date: 1,
	start_time_observed: 1,
	start_time_scheduled: 1,
	trip_id: 1,
};

export const etaVehicleEventTableSchema: ClickHouseColumn<EtaVehicleEvent>[] = [
	{ name: '_id', type: 'String' },
	{ name: 'ride_id', type: 'String' },
	{ name: 'hashed_shape_id', type: 'String' },
	{ name: 'line_id', type: 'UInt16' },
	{ name: 'longitude', type: 'Float64' },
	{ name: 'latitude', type: 'Float64' },
	{ name: 'geohash', type: 'String' },
	{ name: 'created_at', type: 'UInt64' },
	{ name: 'agency_id', type: 'String' },
	{ name: 'vehicle_id', type: 'String' },
];

//

export interface ShapeNode {
	latitude: number
	longitude: number
	node_index: number
	shape_id: string
}

export const shapeNodeTableSchema: ClickHouseColumn<ShapeNode>[] = [
	{ name: 'shape_id', type: 'String' },
	{ name: 'node_index', type: 'UInt32' },
	{ name: 'longitude', type: 'Float64' },
	{ name: 'latitude', type: 'Float64' },
];
