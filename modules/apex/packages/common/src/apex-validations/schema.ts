/* * */

import { type ClickHouseColumn } from '@tmlmobilidade/clickhouse';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';

/* * */

export const simplifiedApexValidationsSchema: ClickHouseColumn<SimplifiedApexValidation>[] = [
	{ name: '_id', primaryKey: true, type: 'String' },
	{ name: 'agency_id', type: 'String' },
	{ name: 'apex_version', type: 'String' },
	{ name: 'card_serial_number', type: 'String' },
	{ name: 'category', type: 'String' },
	{ name: 'created_at', type: 'Int64' },
	{ name: 'device_id', type: 'String' },
	{ name: 'event_type', type: 'Int64' },
	{ name: 'is_passenger', type: 'Bool' },
	{ name: 'line_id', type: 'String' },
	{ name: 'mac_ase_counter_value', type: 'Int64' },
	{ name: 'mac_sam_serial_number', type: 'Int64' },
	{ name: 'on_board_refund_id', type: 'Nullable(String)' },
	{ name: 'on_board_sale_id', type: 'Nullable(String)' },
	{ name: 'pattern_id', type: 'String' },
	{ name: 'product_id', type: 'String' },
	{ name: 'received_at', type: 'Int64' },
	{ name: 'stop_id', type: 'String' },
	{ name: 'trip_id', type: 'String' },
	{ name: 'units_qty', type: 'Nullable(Int64)' },
	{ name: 'updated_at', type: 'Int64' },
	{ name: 'validation_status', type: 'Int64' },
	{ name: 'vehicle_id', type: 'Int64' },
];
