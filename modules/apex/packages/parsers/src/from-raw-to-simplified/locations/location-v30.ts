/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionLocationV30, type SimplifiedApexLocation } from '@tmlmobilidade/go-types-apex';

/* * */

export function parseRawApexTransactionLocationV30(doc: RawApexTransactionLocationV30): null | SimplifiedApexLocation {
	try {
		//

		//
		// Validate the document structure and content

		if (!doc.payload.operatorInfo.operatorLongID) throw new Error('Missing operatorLongID in transaction.');

		//
		// Evaluate the transaction date and ensure it is not before the set earliest date

		if (!doc.payload.transactionInfo.transactionDate) throw new Error('Missing transactionDate in transaction.');

		const earliestTransactionDate = getEarliestDate();

		const transactionDate = Dates
			.fromISO(doc.payload.transactionInfo.transactionDate)
			.setZone('Europe/Lisbon', 'rebase_utc')
			.unix_timestamp;

		if (transactionDate < earliestTransactionDate.unix_timestamp) throw new Error(`Transaction date "${doc.payload.transactionInfo.transactionDate}" is before the earliest allowed date "${earliestTransactionDate.operational_date}".`);

		//
		// Parse the document and return the simplified APEX object

		return {
			_id: doc.payload.transactionInfo.transactionId,
			agency_id: doc.payload.operatorInfo.operatorLongID,
			apex_version: doc.payload.versionInfo.apexVersion,
			created_at: transactionDate,
			device_id: doc.payload.operatorInfo.deviceID,
			line_id: doc.payload.validationServiceInfo.lineLongID,
			mac_ase_counter_value: doc.payload.mac.aseCounterValue,
			mac_sam_serial_number: doc.payload.mac.samSerialNumber,
			pattern_id: doc.payload.validationServiceInfo.patternLongID,
			received_at: doc.created_at,
			stop_id: doc.payload.validationServiceInfo.stopLongID,
			trip_id: doc.payload.validationServiceInfo.journeyID ?? '-',
			updated_at: doc.created_at,
			vehicle_id: doc.payload.validationServiceInfo.vehicleID,
		};
	} catch (error) {
		console.error(`Error parsing simplified APEX Validation. Transaction ID: "${doc.payload.transactionInfo.transactionId}"`, error.message);
		return null;
	}
}
