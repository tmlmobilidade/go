/* * */

import { APEX_LOCATIONS_SETTINGS } from '@/apex-locations/settings.js';
import { getEarliestDate } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type SimplifiedApexLocation } from '@tmlmobilidade/types';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSimplifiedApexLocation(pcgiDoc: any): null | SimplifiedApexLocation {
	try {
		//

		//
		// Validate the document structure and content

		if (!pcgiDoc?.transaction) throw new Error('Missing transaction in document.');

		if (!pcgiDoc.transaction?.operatorLongID) throw new Error('Missing operatorLongID in transaction.');

		if (!APEX_LOCATIONS_SETTINGS.allowed_operator_long_ids.includes(pcgiDoc.transaction.operatorLongID)) throw new Error(`Invalid operatorLongID: "${pcgiDoc.transaction.operatorLongID}"`);

		if (!APEX_LOCATIONS_SETTINGS.allowed_apex_transaction_versions.includes(pcgiDoc.transaction.apexTransactionVersion)) throw new Error(`Invalid apexTransactionVersion: "${pcgiDoc.transaction.apexTransactionVersion}"`);

		if (!APEX_LOCATIONS_SETTINGS.allowed_apex_transaction_types.includes(pcgiDoc.transaction.apexTransactionType)) throw new Error(`Invalid apexTransactionType: "${pcgiDoc.transaction.apexTransactionType}"`);

		//
		// Evaluate the transaction date and ensure it is not before the set earliest date

		if (!pcgiDoc.transaction.transactionDate) throw new Error('Missing transactionDate in transaction.');

		const earliestTransactionDate = getEarliestDate();

		const transactionDate = Dates
			.fromISO(pcgiDoc.transaction.transactionDate)
			.setZone('Europe/Lisbon', 'rebase_utc')
			.unix_timestamp;

		if (transactionDate < earliestTransactionDate.unix_timestamp) throw new Error(`Transaction date "${pcgiDoc.transaction.transactionDate}" is before the earliest allowed date "${earliestTransactionDate.operational_date}".`);

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
	} catch (error) {
		console.error(`Error parsing simplified APEX Location. Transaction ID: "${pcgiDoc.transaction.transactionId}"`, error.message);
		return null;
	}
}
