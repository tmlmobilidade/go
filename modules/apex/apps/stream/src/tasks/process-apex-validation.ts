/* * */

import { Dates } from '@tmlmobilidade/dates';
import { parseSimplifiedApexValidation } from '@tmlmobilidade/go-apex-pckg-parse';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

const simplifiedApexValidationsDbWritter = new ClickHouseWriter<SimplifiedApexValidation>({
	batch_size: 250,
	batch_timeout: 10000,
	clientConfig: {
		database: process.env.CLICKHOUSE_DATABASE,
		password: process.env.CLICKHOUSE_PASSWORD,
		url: `${process.env.CLICKHOUSE_TLS === 'true' ? 'https' : 'http'}://${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`,
		username: process.env.CLICKHOUSE_USERNAME,
	},
	idle_timeout: 10000,
	table: 'simplified_apex_validations',
	tableSchema: [
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
	],
	transformFn: data => ({
		...data,
		_id: String(data._id),
	}),
});

await simplifiedApexValidationsDbWritter.ensureTable(undefined, 'MergeTree', 'created_at');

/* * */

export async function processApexValidation(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		Logger.error(`WARNING: processApexValidation with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const newSimplifiedApexValidationDocument = parseSimplifiedApexValidation(databaseOperation.fullDocument);
	if (!newSimplifiedApexValidationDocument) {
		Logger.error(`Invalid APEX Validation document, skipping operation: ${databaseOperation.fullDocument.transaction.transactionId}`);
		return;
	}

	//
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData?: SimplifiedApexValidation[]) => {
		if (!flushedData || flushedData.length === 0) return;

		try {
			//

			const invalidationTimer = new Timer();

			//
			// Map the flushed data to the query that will be used to invalidate documents

			const updateRidesOps = flushedData.map((writeOp) => {
				const standardWindowInterval = Dates.fromUnixTimestamp(writeOp.created_at).std_window;
				return {
					start_time_scheduled: { $gte: standardWindowInterval.start, $lte: standardWindowInterval.end },
					trip_id: writeOp.trip_id,
				};
			}).filter(item => !!item.trip_id);

			if (updateRidesOps.length === 0) return;

			//
			// Invalidate all documents that are affected

			const updateRidesResult = await rides.updateMany({ $or: updateRidesOps }, { system_status: 'waiting' }, { returnResults: false });

			Logger.info(`Flush [simplified_apex_validations]: Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides (${invalidationTimer.get()})`);

			//
		}
		catch (error) {
			Logger.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new vehicle event document to the SimplifiedApexValidations collection

	await simplifiedApexValidationsDbWritter.write(newSimplifiedApexValidationDocument, undefined, flushCallback);

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedApexValidationDocument.agency_id === '41') fetch('https://status.carrismetropolitana.pt/api/push/QRSatZitiBNIhTDneykCGV0PthvQoIUf');
	if (newSimplifiedApexValidationDocument.agency_id === '42') fetch('https://status.carrismetropolitana.pt/api/push/uZTfvExA1yCpNZIXIzgvCmHdSquNi0lV');
	if (newSimplifiedApexValidationDocument.agency_id === '43') fetch('https://status.carrismetropolitana.pt/api/push/Rp7hYCJKLL8h67IP07RDAXagwO5avchc');
	if (newSimplifiedApexValidationDocument.agency_id === '44') fetch('https://status.carrismetropolitana.pt/api/push/Mnm5Rn3tJAXYVWb6I51eTA4xfpXJ3vqq');

	//
};
