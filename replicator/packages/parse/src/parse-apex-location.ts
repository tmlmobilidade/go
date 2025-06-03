/* * */

import { type SimplifiedApexLocation } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseSimplifiedApexLocation(pcgiDoc: any): null | SimplifiedApexLocation {
	try {
		// Validate the operatorLongID
		if (!pcgiDoc?.transaction?.operatorLongID) throw new Error('Missing operatorLongID in transaction');
		if (!['41', '42', '43'].includes(pcgiDoc.transaction.operatorLongID)) throw new Error(`Invalid operatorLongID: ${pcgiDoc.transaction.operatorLongID}`);
		// Parse the document and return the simplified APEX object
		return {
			_id: pcgiDoc.transaction.transactionId,
			agency_id: pcgiDoc.transaction.operatorLongID,
			apex_version: pcgiDoc.transaction.apexVersion,
			created_at: Dates
				.fromISO(pcgiDoc.transaction.transactionDate)
				.setZone('Europe/Lisbon', 'rebase_utc') // Ensure the date is interpreted in Lisbon timezone
				.unix_timestamp,
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
	}
	catch (error) {
		if (process.env.DEBUG_MODE) console.error(`Error parsing simplified APEX Location. Transaction ID: "${pcgiDoc.transaction.transactionId}"`, error.message);
		return null;
	}
}
