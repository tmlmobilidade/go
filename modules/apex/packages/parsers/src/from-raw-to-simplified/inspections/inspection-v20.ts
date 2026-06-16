/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionInspectionV20, type SimplifiedApexInspection } from '@tmlmobilidade/go-types-apex';

/* * */

export function parseRawApexTransactionInspectionV20(doc: RawApexTransactionInspectionV20): null | SimplifiedApexInspection {
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
			card_serial_number: doc.payload.cardInfo.cardSerialNumber,
			control_destination_stop_id: doc.payload.controlServiceInfo.controlDestinationStopLongID,
			control_origin_stop_id: doc.payload.controlServiceInfo.controlOriginStopLongID,
			control_status: doc.payload.controlInfo.controlStatus,
			created_at: transactionDate,
			device_id: doc.payload.operatorInfo.deviceID,
			environment_status: doc.payload.controlInfo.environmentStatus,
			inspection_id: null,
			is_ok: false,
			is_ok_pcgi: false,
			line_id: doc.payload.controlServiceInfo.lineLongID,
			mac_ase_counter_value: doc.payload.mac.aseCounterValue,
			mac_sam_serial_number: doc.payload.mac.samSerialNumber,
			pattern_id: doc.payload.controlServiceInfo.patternLongID,
			product_id: doc.payload.controlInfo.productLongID,
			received_at: doc.created_at,
			trip_id: doc.payload.controlServiceInfo.journeyID,
			vehicle_id: doc.payload.controlServiceInfo.vehicleID,
		};
	} catch (error) {
		console.error(`Error parsing simplified APEX Validation. Transaction ID: "${doc.payload.transactionInfo.transactionId}"`, error.message);
		return null;
	}
}
