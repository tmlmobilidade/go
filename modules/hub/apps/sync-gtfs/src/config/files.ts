/* * */

import type { SQLiteColumn } from '@tmlmobilidade/sqlite';

export interface GtfsFile {
	_key: string
	batch_size?: number
	columns: SQLiteColumn<Record<string, boolean | number | string>>[]
	extension: string
	headers: string[]
}

/* * */

const allGtfsFiles: GtfsFile[] = [
	//

	{
		_key: 'municipalities',
		batch_size: 10000,
		columns: [
			{ name: 'municipality_prefix', type: 'TEXT' },
			{ indexed: true, name: 'municipality_id', type: 'TEXT' },
			{ name: 'municipality_name', type: 'TEXT' },
			{ name: 'district_id', type: 'TEXT' },
			{ name: 'district_name', type: 'TEXT' },
			{ name: 'region_id', type: 'TEXT' },
			{ name: 'region_name', type: 'TEXT' },
		],
		extension: 'txt',
		headers: [
			'municipality_prefix',
			'municipality_id',
			'municipality_name',
			'district_id',
			'district_name',
			'region_id',
			'region_name',
		],
	},

	{
		_key: 'periods',
		batch_size: 10000,
		columns: [
			{ indexed: true, name: 'period_id', type: 'TEXT' },
			{ name: 'period_name', type: 'TEXT' },
		],
		extension: 'txt',
		headers: [
			'period_id',
			'period_name',
		],
	},

	{
		_key: 'dates',
		batch_size: 10000,
		columns: [
			{ indexed: true, name: 'date', type: 'TEXT' },
			{ name: 'period', type: 'TEXT' },
			{ name: 'day_type', type: 'TEXT' },
			{ name: 'holiday', type: 'TEXT' },
			{ name: 'description', type: 'TEXT' },
		],
		extension: 'txt',
		headers: [
			'date',
			'period',
			'day_type',
			'holiday',
			'description',
		],
	},

	{
		_key: 'plans',
		batch_size: 10000,
		columns: [
			{ indexed: true, name: 'plan_id', type: 'TEXT' },
			{ name: 'agency_id', type: 'TEXT' },
			{ name: 'plan_start_date', type: 'TEXT' },
			{ name: 'plan_end_date', type: 'TEXT' },
		],
		extension: 'txt',
		headers: [
			'plan_id',
			'agency_id',
			'plan_start_date',
			'plan_end_date',
		],
	},

	{
		_key: 'calendar_dates',
		batch_size: 10000,
		columns: [
			{ indexed: true, name: 'service_id', type: 'TEXT' },
			{ name: 'date', type: 'TEXT' },
			{ name: 'period', type: 'TEXT' },
			{ name: 'day_type', type: 'TEXT' },
			{ name: 'holiday', type: 'TEXT' },
			{ name: 'exception_type', type: 'TEXT' },
		],
		extension: 'txt',
		headers: [
			'service_id',
			'date',
			'period',
			'day_type',
			'holiday',
			'exception_type',
		],
	},

	{
		_key: 'routes',
		batch_size: 10000,
		columns: [
			{ name: 'agency_id', type: 'TEXT' },
			{ name: 'line_id', type: 'TEXT' },
			{ name: 'line_short_name', type: 'TEXT' },
			{ name: 'line_long_name', type: 'TEXT' },
			{ indexed: true, name: 'route_id', type: 'TEXT' },
			{ name: 'route_short_name', type: 'TEXT' },
			{ name: 'route_long_name', type: 'TEXT' },
			{ name: 'route_type', type: 'TEXT' },
			{ name: 'route_color', type: 'TEXT' },
			{ name: 'route_text_color', type: 'TEXT' },
		],
		extension: 'txt',
		headers: [
			'agency_id',
			'line_id',
			'line_short_name',
			'line_long_name',
			'route_id',
			'route_short_name',
			'route_long_name',
			'route_type',
			'route_color',
			'route_text_color',
		],
	},

	{
		_key: 'shapes',
		batch_size: 100000,
		columns: [
			{ indexed: true, name: 'shape_id', type: 'TEXT' },
			{ name: 'shape_pt_lat', type: 'REAL' },
			{ name: 'shape_pt_lon', type: 'REAL' },
			{ name: 'shape_pt_sequence', type: 'INTEGER' },
			{ name: 'shape_dist_traveled', type: 'REAL' },
		],
		extension: 'txt',
		headers: [
			'shape_id',
			'shape_pt_lat',
			'shape_pt_lon',
			'shape_pt_sequence',
			'shape_dist_traveled',
		],
	},

	{
		_key: 'trips',
		batch_size: 10000,
		columns: [
			{ indexed: true, name: 'route_id', type: 'TEXT' },
			{ indexed: true, name: 'pattern_id', type: 'TEXT' },
			{ name: 'service_id', type: 'TEXT' },
			{ name: 'trip_id', type: 'TEXT' },
			{ name: 'trip_headsign', type: 'TEXT' },
			{ name: 'direction_id', type: 'INTEGER' },
			{ name: 'shape_id', type: 'TEXT' },
			{ name: 'calendar_desc', type: 'TEXT' },
		],
		extension: 'txt',
		headers: [
			'route_id',
			'pattern_id',
			'service_id',
			'trip_id',
			'trip_headsign',
			'direction_id',
			'shape_id',
			'calendar_desc',
		],
	},

	{
		_key: 'stop_times',
		batch_size: 100000,
		columns: [
			{ indexed: true, name: 'trip_id', type: 'TEXT' },
			{ name: 'arrival_time', type: 'TEXT' },
			{ indexed: true, name: 'stop_id', type: 'TEXT' },
			{ name: 'stop_sequence', type: 'INTEGER' },
			{ name: 'shape_dist_traveled', type: 'TEXT' },
			{ name: 'pickup_type', type: 'TEXT' },
			{ name: 'drop_off_type', type: 'TEXT' },
		],
		extension: 'txt',
		headers: [
			'trip_id',
			'arrival_time',
			'stop_id',
			'stop_sequence',
			'shape_dist_traveled',
			'pickup_type',
			'drop_off_type',
		],
	},

	{
		_key: 'stops',
		batch_size: 10000,
		columns: [
			{ indexed: true, name: 'stop_id', type: 'TEXT' },
			{ name: 'stop_name', type: 'TEXT' },
			{ name: 'stop_short_name', type: 'TEXT' },
			{ name: 'tts_stop_name', type: 'TEXT' },
			{ name: 'operational_status', type: 'TEXT' },
			{ name: 'stop_lat', type: 'TEXT' },
			{ name: 'stop_lon', type: 'TEXT' },
			{ name: 'locality_id', type: 'TEXT' },
			{ name: 'locality_name', type: 'TEXT' },
			{ name: 'parish_id', type: 'TEXT' },
			{ name: 'parish_name', type: 'TEXT' },
			{ name: 'municipality_id', type: 'TEXT' },
			{ name: 'municipality_name', type: 'TEXT' },
			{ name: 'district_id', type: 'TEXT' },
			{ name: 'district_name', type: 'TEXT' },
			{ name: 'wheelchair_boarding', type: 'TEXT' },
			{ name: 'near_health_clinic', type: 'BOOLEAN' },
			{ name: 'near_hospital', type: 'BOOLEAN' },
			{ name: 'near_university', type: 'BOOLEAN' },
			{ name: 'near_school', type: 'BOOLEAN' },
			{ name: 'near_police_station', type: 'BOOLEAN' },
			{ name: 'near_fire_station', type: 'BOOLEAN' },
			{ name: 'near_shopping', type: 'BOOLEAN' },
			{ name: 'near_historic_building', type: 'BOOLEAN' },
			{ name: 'near_transit_office', type: 'BOOLEAN' },
			{ name: 'light_rail', type: 'BOOLEAN' },
			{ name: 'subway', type: 'BOOLEAN' },
			{ name: 'train', type: 'BOOLEAN' },
			{ name: 'boat', type: 'BOOLEAN' },
			{ name: 'airport', type: 'BOOLEAN' },
			{ name: 'bike_sharing', type: 'BOOLEAN' },
			{ name: 'bike_parking', type: 'BOOLEAN' },
			{ name: 'car_parking', type: 'BOOLEAN' },
		],
		extension: 'txt',
		headers: [
			'stop_id',
			'stop_name',
			'stop_short_name',
			'tts_stop_name',
			'operational_status',
			'stop_lat',
			'stop_lon',
			'locality_id',
			'locality_name',
			'parish_id',
			'parish_name',
			'municipality_id',
			'municipality_name',
			'district_id',
			'district_name',
			'wheelchair_boarding',
			'near_health_clinic',
			'near_hospital',
			'near_university',
			'near_school',
			'near_police_station',
			'near_fire_station',
			'near_shopping',
			'near_historic_building',
			'near_transit_office',
			'light_rail',
			'subway',
			'train',
			'boat',
			'airport',
			'bike_sharing',
			'bike_parking',
			'car_parking',
		],
	},

	//
];

/* * */

export default allGtfsFiles;
