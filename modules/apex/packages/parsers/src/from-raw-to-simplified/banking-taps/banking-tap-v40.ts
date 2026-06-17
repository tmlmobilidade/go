/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionBankingTapV40, type SimplifiedApexBankingTap, SimplifiedApexBankingTapSchema } from '@tmlmobilidade/go-types-apex';

/* * */

export function parseRawApexTransactionBankingTapV40IntoSimplifiedApexBankingTap(doc: RawApexTransactionBankingTapV40): null | SimplifiedApexBankingTap {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromFormat(doc.payload.transactionInfo.transactionDate, 'yyyy-MM-dd\'T\'HH:mm:ss', 'Europe/Lisbon');

	//
	// Validate the document structure and content

	const result: SimplifiedApexBankingTap = {
		_id: doc.payload.transactionInfo.transactionId,
		agency_id: doc.payload.operatorInfo.operatorLongID,
		apex_version: doc.payload.versionInfo.apexVersion,
		banking_token: doc.payload.tapInInfo.bankingToken,
		card_brand: doc.payload.tapInInfo.cardBrand,
		card_pan: doc.payload.tapInInfo.cardPan,
		created_at: transactionDateValue.unix_timestamp,
		device_id: doc.payload.operatorInfo.deviceID,
		event_type: null,
		is_ok: false,
		is_ok_pcgi: doc.is_ok,
		line_id: doc.payload.serviceInfo.lineLongID,
		mac_ase_counter_value: doc.payload.mac.aseCounterValue,
		mac_sam_serial_number: doc.payload.mac.samSerialNumber,
		pattern_id: doc.payload.serviceInfo.patternLongID,
		product_id: doc.payload.tapInInfo.productLongID,
		received_at: doc.received_at,
		stop_id: doc.payload.serviceInfo.stopLongID,
		trip_id: doc.payload.serviceInfo.journeyID,
		units_qty: doc.payload.tapInInfo.groupDimension,
		updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
		vehicle_id: doc.payload.serviceInfo.vehicleID,
	};

	return SimplifiedApexBankingTapSchema.parse(result);
}
