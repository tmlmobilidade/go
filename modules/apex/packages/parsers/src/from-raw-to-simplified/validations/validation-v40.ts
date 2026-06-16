/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionValidationV40, type SimplifiedApexValidation, SimplifiedApexValidationSchema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parseRawApexTransactionValidationV40IntoSimplifiedApexValidation(doc: RawApexTransactionValidationV40): null | SimplifiedApexValidation {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromISO(doc.payload.transactionInfo.transactionDate)
		.setZone('Europe/Lisbon', 'rebase_utc');

	//
	// Validate the document structure and content

	const result: SimplifiedApexValidation = {
		_id: doc.payload.transactionInfo.transactionId,
		agency_id: doc.payload.operatorInfo.operatorLongID,
		apex_version: doc.payload.versionInfo.apexVersion,
		calendar_date: transactionDateValue.calendar_date,
		card_serial_number: doc.payload.cardInfo.cardSerialNumber,
		category: 'subscription',
		created_at: transactionDateValue.unix_timestamp,
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
		received_at: doc.received_at,
		stop_id: doc.payload.serviceInfo.stopLongID,
		trip_id: doc.payload.serviceInfo.journeyID,
		units_qty: 0,
		validation_status: 0,
		vehicle_id: doc.payload.serviceInfo.vehicleID,
	};

	return SimplifiedApexValidationSchema.parse(result);
}
