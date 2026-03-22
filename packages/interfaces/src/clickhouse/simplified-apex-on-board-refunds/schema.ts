/* * */

import { ClickHouseColumn } from '@tmlmobilidade/clickhouse';
import { SimplifiedApexOnBoardRefund } from '@tmlmobilidade/types';

/* * */

export const simplifiedApexOnBoardRefundsSchema: ClickHouseColumn<SimplifiedApexOnBoardRefund>[] = [
	{ name: '_id', type: 'String' },
	{ name: 'created_at', type: 'String' },
	{ name: 'updated_at', type: 'String' },
	{ name: 'agency_id', type: 'String' },
	{ name: 'apex_version', type: 'String' },
	{ name: 'device_id', type: 'String' },
	{ name: 'line_id', type: 'String' },
	{ name: 'mac_ase_counter_value', type: 'String' },
	{ name: 'mac_sam_serial_number', type: 'String' },
	{ name: 'pattern_id', type: 'String' },
	{ name: 'received_at', type: 'String' },
	{ name: 'stop_id', type: 'String' },
	{ name: 'trip_id', type: 'String' },
	{ name: 'vehicle_id', type: 'String' },
	{ name: 'block_id', type: 'String' },
	{ name: 'card_physical_type', type: 'String' },
	{ name: 'card_serial_number', type: 'String' },
	{ name: 'duty_id', type: 'String' },
	{ name: 'on_board_sale_id', type: 'String' },
	{ name: 'payment_method', type: 'String' },
	{ name: 'price', type: 'String' },
	{ name: 'product_long_id', type: 'String' },
	{ name: 'product_quantity', type: 'String' },
	{ name: 'validation_id', type: 'String' },
];
