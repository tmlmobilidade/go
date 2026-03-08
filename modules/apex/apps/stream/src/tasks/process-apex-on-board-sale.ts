/* * */

import { Dates } from '@tmlmobilidade/dates';
import { parseSimplifiedApexOnBoardSale } from '@tmlmobilidade/go-apex-pckg-parse';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedApexOnBoardSale } from '@tmlmobilidade/types';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

const simplifiedApexOnBoardSalesDbWritter = new ClickHouseWriter<SimplifiedApexOnBoardSale>({
	batch_size: 250,
	batch_timeout: 10000,
	clientConfig: {
		database: process.env.CLICKHOUSE_DATABASE,
		password: process.env.CLICKHOUSE_PASSWORD,
		url: `${process.env.CLICKHOUSE_TLS === 'true' ? 'https' : 'http'}://${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`,
		username: process.env.CLICKHOUSE_USERNAME,
	},
	idle_timeout: 10000,
	table: 'simplified_apex_on_board_sales',
	tableSchema: [
		{ name: '_id', primaryKey: true, type: 'String' },
		{ name: 'agency_id', type: 'String' },
		{ name: 'apex_version', type: 'String' },
		{ name: 'block_id', type: 'Nullable(String)' },
		{ name: 'card_physical_type', type: 'Int64' },
		{ name: 'card_serial_number', type: 'String' },
		{ name: 'created_at', type: 'Int64' },
		{ name: 'device_id', type: 'String' },
		{ name: 'duty_id', type: 'Nullable(String)' },
		{ name: 'is_passenger', type: 'Bool' },
		{ name: 'line_id', type: 'Nullable(String)' },
		{ name: 'mac_ase_counter_value', type: 'Int64' },
		{ name: 'mac_sam_serial_number', type: 'Int64' },
		{ name: 'on_board_refund_id', type: 'Nullable(String)' },
		{ name: 'pattern_id', type: 'Nullable(String)' },
		{ name: 'payment_method', type: 'Int64' },
		{ name: 'price', type: 'Float64' },
		{ name: 'product_long_id', type: 'String' },
		{ name: 'product_quantity', type: 'Int64' },
		{ name: 'received_at', type: 'Int64' },
		{ name: 'stop_id', type: 'Nullable(String)' },
		{ name: 'trip_id', type: 'Nullable(String)' },
		{ name: 'updated_at', type: 'Int64' },
		{ name: 'validation_id', type: 'Nullable(String)' },
		{ name: 'vehicle_id', type: 'Nullable(Int64)' },
	],
	transformFn: data => ({
		...data,
		_id: String(data._id),
	}),
});

await simplifiedApexOnBoardSalesDbWritter.ensureTable(undefined, 'MergeTree', 'created_at');

/* * */

export async function processApexOnBoardSale(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		Logger.error(`WARNING: processApexOnBoardSale with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const newSimplifiedApexOnBoardSaleDocument = parseSimplifiedApexOnBoardSale(databaseOperation.fullDocument);
	if (!newSimplifiedApexOnBoardSaleDocument) {
		Logger.error(`Invalid APEX OnBoard Sale document, skipping operation: ${databaseOperation.fullDocument.transaction.transactionId}`);
		return;
	}

	//
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData?: SimplifiedApexOnBoardSale[]) => {
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

			Logger.info(`Flush [simplified_apex_on_board_sales]: Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides (${invalidationTimer.get()})`);

			//
		}
		catch (error) {
			Logger.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new vehicle event document to the SimplifiedApexOnBoardSales collection

	await simplifiedApexOnBoardSalesDbWritter.write(newSimplifiedApexOnBoardSaleDocument, undefined, flushCallback);

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedApexOnBoardSaleDocument.agency_id === '41') fetch('https://status.carrismetropolitana.pt/api/push/HgrvaEVk6VISWWZTdAQ0ZOdeH9Oy6FkF');
	if (newSimplifiedApexOnBoardSaleDocument.agency_id === '42') fetch('https://status.carrismetropolitana.pt/api/push/CHni29ZNR6lLd7F5W1H7tEWXm7CC0wwj');
	if (newSimplifiedApexOnBoardSaleDocument.agency_id === '43') fetch('https://status.carrismetropolitana.pt/api/push/HmdyQgowD6Jl9eQDUSqKC3qIWDr0UimO');
	if (newSimplifiedApexOnBoardSaleDocument.agency_id === '44') fetch('https://status.carrismetropolitana.pt/api/push/vsck1MphlVyeUgy6PPnTIjIRPEfNor6t');

	//
};
