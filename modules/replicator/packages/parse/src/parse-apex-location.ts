/* * */

import { type SimplifiedApexLocation } from '@tmlmobilidade/go-types';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

const ALLOWED_OPERATOR_LONG_IDS = ['41', '42', '43', '44'];

const ALLOWED_APEX_TRANSACTION_VERSIONS = ['3.0'];

const ALLOWED_APEX_TRANSACTION_TYPES = [19]; // Location Transaction

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSimplifiedApexLocation(pcgiDoc: any): null | SimplifiedApexLocation {
	try {
		//

		//
		// Validate the document structure and content

		if (!pcgiDoc?.transaction) throw new Error('Missing transaction in document.');

		if (!pcgiDoc.transaction?.operatorLongID) throw new Error('Missing operatorLongID in transaction.');

		if (!ALLOWED_OPERATOR_LONG_IDS.includes(pcgiDoc.transaction.operatorLongID)) throw new Error(`Invalid operatorLongID: "${pcgiDoc.transaction.operatorLongID}"`);

		if (!ALLOWED_APEX_TRANSACTION_VERSIONS.includes(pcgiDoc.transaction.apexTransactionVersion)) throw new Error(`Invalid apexTransactionVersion: "${pcgiDoc.transaction.apexTransactionVersion}"`);

		if (!ALLOWED_APEX_TRANSACTION_TYPES.includes(pcgiDoc.transaction.apexTransactionType)) throw new Error(`Invalid apexTransactionType: "${pcgiDoc.transaction.apexTransactionType}"`);

		//
		// Evaluate the transaction date and ensure it is not before the set earliest date

		if (!pcgiDoc.transaction.transactionDate) throw new Error('Missing transactionDate in transaction.');

		if (!process.env.SYNC_EARLIEST_DATE) throw new Error('Missing SYNC_EARLIEST_DATE environment variable.');

		const earliestTransactionDate = Dates
			.fromOperationalDate(process.env.SYNC_EARLIEST_DATE, 'Europe/Lisbon')
			.unix_timestamp;

		const transactionDate = Dates
			.fromISO(pcgiDoc.transaction.transactionDate)
			.setZone('Europe/Lisbon', 'rebase_utc')
			.unix_timestamp;

		if (transactionDate < earliestTransactionDate) throw new Error(`Transaction date "${pcgiDoc.transaction.transactionDate}" is before the earliest allowed date "${process.env.SYNC_EARLIEST_DATE}".`);

		//
		// Parse the document and return the simplified APEX object

		return {
			_id: pcgiDoc.transaction.transactionId,
			agency_id: pcgiDoc.transaction.operatorLongID,
			apex_version: pcgiDoc.transaction.apexVersion,
			created_at: transactionDate,
			device_id: pcgiDoc.transaction.deviceID,
			line_id: pcgiDoc.transaction.lineLongID,
			mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
			mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
			pattern_id: pcgiDoc.transaction.patternLongID,
			received_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
			stop_id: pcgiDoc.transaction.stopLongID,
			trip_id: pcgiDoc.transaction.journeyID,
			updated_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
			vehicle_id: pcgiDoc.transaction.vehicleID,
		};

		//
	}
	catch (error) {
		if (process.env.DEBUG_MODE) console.error(`Error parsing simplified APEX Location. Transaction ID: "${pcgiDoc.transaction.transactionId}"`, error.message);
		return null;
	}
}
