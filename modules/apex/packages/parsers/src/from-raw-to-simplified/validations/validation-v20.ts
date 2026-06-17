/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionValidationV20, type SimplifiedApexValidation, SimplifiedApexValidationSchema } from '@tmlmobilidade/go-types-apex';
import { toUInt64 } from '@tmlmobilidade/utils';

/* * */

export function parseRawApexTransactionValidationV20IntoSimplifiedApexValidation(doc: RawApexTransactionValidationV20): null | SimplifiedApexValidation {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromFormat(doc.payload.transactionInfo.transactionDate, 'yyyy-MM-dd\'T\'HH:mm:ss', 'Europe/Lisbon');

	//
	// Validate the document structure and content

	const result: SimplifiedApexValidation = {
		_id: doc.payload.transactionInfo.transactionId,
		agency_id: doc.payload.operatorInfo.operatorLongID,
		apex_version: doc.payload.versionInfo.apexVersion,
		card_serial_number: toUInt64(doc.payload.cardInfo.cardSerialNumber),
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
		updated_at: Dates.now('utc').unix_timestamp,
		validation_status: '0',
		vehicle_id: doc.payload.serviceInfo.vehicleID,
	};

	return SimplifiedApexValidationSchema.parse(result);
}
