/* * */

import { ClickHouseColumn } from '@tmlmobilidade/clickhouse';
import { type SimplifiedApexLocation } from '@tmlmobilidade/types';

/* * */

export const simplifiedApexLocationsSchema: ClickHouseColumn<SimplifiedApexLocation>[] = [
	{ name: '_id', primaryKey: true, type: 'String' },
	{ name: 'created_at', type: 'Int64' },
	{ name: 'updated_at', type: 'Int64' },
	{ name: 'agency_id', type: 'String' },
	{ name: 'apex_version', type: 'String' },
	{ name: 'device_id', type: 'String' },
	{ name: 'line_id', type: 'String' },
	{ name: 'mac_ase_counter_value', type: 'Int64' },
	{ name: 'mac_sam_serial_number', type: 'Int64' },
	{ name: 'pattern_id', type: 'String' },
	{ name: 'received_at', type: 'Int64' },
	{ name: 'stop_id', type: 'String' },
	{ name: 'trip_id', type: 'String' },
	{ name: 'vehicle_id', type: 'Int64' },
];
