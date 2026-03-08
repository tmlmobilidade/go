/* * */

import { Dates } from '@tmlmobilidade/dates';
import { parseSimplifiedApexLocation } from '@tmlmobilidade/go-apex-pckg-parse';
import { rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type SimplifiedApexLocation } from '@tmlmobilidade/types';
import { ClickHouseWriter } from '@tmlmobilidade/writers';

/* * */

const simplifiedApexLocationsDbWritter = new ClickHouseWriter<SimplifiedApexLocation>({
	batch_size: 250,
	batch_timeout: 10000,
	clientConfig: {
		database: process.env.CLICKHOUSE_DATABASE,
		password: process.env.CLICKHOUSE_PASSWORD,
		url: `${process.env.CLICKHOUSE_TLS === 'true' ? 'https' : 'http'}://${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`,
		username: process.env.CLICKHOUSE_USERNAME,
	},
	idle_timeout: 10000,
	table: 'simplified_apex_locations',
	tableSchema: [
		{ name: '_id', primaryKey: true, type: 'String' },
		{ name: 'agency_id', type: 'String' },
		{ name: 'apex_version', type: 'String' },
		{ name: 'created_at', type: 'Int64' },
		{ name: 'device_id', type: 'String' },
		{ name: 'line_id', type: 'String' },
		{ name: 'mac_ase_counter_value', type: 'Int64' },
		{ name: 'mac_sam_serial_number', type: 'Int64' },
		{ name: 'pattern_id', type: 'String' },
		{ name: 'received_at', type: 'Int64' },
		{ name: 'stop_id', type: 'String' },
		{ name: 'trip_id', type: 'String' },
		{ name: 'updated_at', type: 'Int64' },
		{ name: 'vehicle_id', type: 'Int64' },
	],
	transformFn: data => ({
		...data,
		_id: String(data._id),
	}),
});

await simplifiedApexLocationsDbWritter.ensureTable(undefined, 'MergeTree', 'created_at');

/* * */

export async function processApexLocation(databaseOperation) {
	//

	//
	// Validate that the operation is an insert or update. Otherwise, send an email to the emergency contact.
	// Only insert operations are expected to occur in this PCGIDB collection.

	if (databaseOperation.operationType !== 'insert') {
		Logger.error(`WARNING: processApexLocation with operationType != "insert": [${databaseOperation.fullDocument.transaction.operatorLongID}] type="${databaseOperation.operationType}" transactionId="${databaseOperation.fullDocument.transaction.transactionId}"`);
	}

	//
	// Extract the PCGI document from the database operation
	// and transform the vehicle timestamp into an operational date.
	// Skip the operation if the document is not valid.

	const newSimplifiedApexLocationDocument = parseSimplifiedApexLocation(databaseOperation.fullDocument);
	if (!newSimplifiedApexLocationDocument) {
		Logger.error(`Invalid APEX Location document, skipping operation: ${databaseOperation.fullDocument.transaction.transactionId}`);
		return;
	}

	//
	// Setup the callback function that will be called on the DB Writer flush operation
	// to invalidate all the rides that are affected by the new data.

	const flushCallback = async (flushedData?: SimplifiedApexLocation[]) => {
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

			Logger.info(`Flush [simplified_apex_locations]: Marked as 'waiting': ${updateRidesResult.modifiedCount} Rides (${invalidationTimer.get()})`);

			//
		}
		catch (error) {
			Logger.error('Error in flushCallback', error);
		}
	};

	//
	// Write the new vehicle event document to the SimplifiedApexLocations collection

	await simplifiedApexLocationsDbWritter.write(newSimplifiedApexLocationDocument, undefined, flushCallback);

	//
	// Publish the heartbeats for each agency

	if (newSimplifiedApexLocationDocument.agency_id === '41') fetch('https://status.carrismetropolitana.pt/api/push/lyDgVjnFM9Q0Rmq2XI8rXCNdkTJDF6ap');
	if (newSimplifiedApexLocationDocument.agency_id === '42') fetch('https://status.carrismetropolitana.pt/api/push/tk8zt1vosRuR3Bbq92lBqzRLMdsO47UK');
	if (newSimplifiedApexLocationDocument.agency_id === '43') fetch('https://status.carrismetropolitana.pt/api/push/hyVcJagfcSybkuXq1qgYqMHpRUmPhym8');
	if (newSimplifiedApexLocationDocument.agency_id === '44') fetch('https://status.carrismetropolitana.pt/api/push/pIqJwHHscWTLpG5850CeVFNbwnQGiAyk');

	//
};
