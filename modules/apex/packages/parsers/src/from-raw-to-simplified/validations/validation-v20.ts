/* * */

import { getEarliestDate } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionValidationV20, type SimplifiedApexValidation } from '@tmlmobilidade/types';

/* * */

export function parseRawApexTransactionValidationV20(doc: RawApexTransactionValidationV20): null | SimplifiedApexValidation {
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
			category: 'subscription',
			created_at: transactionDate,
			device_id: doc.payload.operatorInfo.deviceID,
			event_type: doc.payload.validationInfo.eventType,
			is_ok: false,
			is_ok_pcgi: doc.is_ok,
			is_passenger: false,
			line_id: doc.payload.serviceInfo.lineLongID,
			mac_ase_counter_value: doc.payload.mac.aseCounterValue,
			mac_sam_serial_number: doc.payload.mac.samSerialNumber,
			on_board_refund_id: null,
			on_board_sale_id: null,
			pattern_id: doc.payload.serviceInfo.patternLongID,
			product_id: doc.payload.validationInfo.productLongID,
			received_at: doc.created_at,
			stop_id: doc.payload.serviceInfo.stopLongID,
			trip_id: doc.payload.serviceInfo.journeyID,
			units_qty: 0,
			validation_status: 0,
			vehicle_id: doc.payload.serviceInfo.vehicleID,
		};
	} catch (error) {
		console.error(`Error parsing simplified APEX Validation. Transaction ID: "${doc.payload.transactionInfo.transactionId}"`, error.message);
		return null;
	}
}
