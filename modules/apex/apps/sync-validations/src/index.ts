/* * */

import { ClickHouseColumn, clickhouseService } from '@tmlmobilidade/clickhouse';
import { parseSimplifiedApexValidation } from '@tmlmobilidade/go-apex-pckg-parse';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

const simplifiedApexValidationsSchema: ClickHouseColumn<SimplifiedApexValidation>[] = [
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

async function syncApexValidations() {
	try {
		//

		Logger.init();

		const globalTimer = new Timer();

		const client = await clickhouseService.getClient();
		const writer = new ClickHouseWriter<SimplifiedApexValidation>({
			client,
			table: 'simplified_apex_validations',
			tableSchema: simplifiedApexValidationsSchema,
			transformFn: parseSimplifiedApexValidation,
		});

		//

		Logger.terminate(`Run took ${globalTimer.get()}.`);

		//
	} catch (err) {
		console.log('An error occurred. Halting execution.', err);
	}
}

/* * */
await runOnInterval(syncApexValidations, 1_800_000); // 30 minutes
