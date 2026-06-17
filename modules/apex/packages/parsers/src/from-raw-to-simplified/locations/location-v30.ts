/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionLocationV30, type SimplifiedApexLocation, SimplifiedApexLocationSchema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parseRawApexTransactionLocationV30IntoSimplifiedApexLocation(doc: RawApexTransactionLocationV30): null | SimplifiedApexLocation {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromISO(doc.payload.transactionInfo.transactionDate)
		.setZone('Europe/Lisbon', 'rebase_utc');

	//
	// Validate the document structure and content

	const result: SimplifiedApexLocation = {
		_id: doc.payload.transactionInfo.transactionId,
		agency_id: doc.payload.operatorInfo.operatorLongID,
		apex_version: doc.payload.versionInfo.apexVersion,
		calendar_date: transactionDateValue.calendar_date,
		created_at: transactionDateValue.unix_timestamp,
		device_id: doc.payload.operatorInfo.deviceID,
		line_id: doc.payload.validationServiceInfo.lineLongID,
		mac_ase_counter_value: doc.payload.mac.aseCounterValue,
		mac_sam_serial_number: doc.payload.mac.samSerialNumber,
		pattern_id: doc.payload.validationServiceInfo.patternLongID,
		received_at: doc.received_at,
		stop_id: doc.payload.validationServiceInfo.stopLongID,
		trip_id: doc.payload.validationServiceInfo.journeyID,
		updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
		vehicle_id: doc.payload.validationServiceInfo.vehicleID,
	};

	return SimplifiedApexLocationSchema.parse(result);
}
