/* * */

import { type ClickHouseColumn } from '@tmlmobilidade/databases';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/types';

/* * */

export const simplifiedVehicleEventsSchema: ClickHouseColumn<SimplifiedVehicleEvent>[] = [
	//

	// Required Fields
	{ name: '_id', type: 'String' },
	{ name: 'agency_id', type: 'String' },
	{ name: 'created_at', type: 'UInt64' },
	{ name: 'latitude', type: 'Float64' },
	{ name: 'longitude', type: 'Float64' },
	{ name: 'received_at', type: 'UInt64' },
	{ name: 'trip_id', type: 'String' },
	{ name: 'vehicle_id', type: 'String' },

	// Optional Fields
	{ name: 'bearing', type: 'Nullable(Float64)' },
	{ name: 'current_status', type: 'Nullable(String)' },
	{ name: 'door', type: 'Nullable(String)' },
	{ name: 'driver_id', type: 'Nullable(String)' },
	{ name: 'extra_trip_id', type: 'Nullable(String)' },
	{ name: 'odometer', type: 'Nullable(Float64)' },
	{ name: 'pattern_id', type: 'Nullable(String)' },
	{ name: 'stop_id', type: 'Nullable(String)' },
];
/* * */
