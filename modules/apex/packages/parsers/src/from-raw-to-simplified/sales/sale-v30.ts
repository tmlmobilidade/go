/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionSaleV30, type SimplifiedApexOnBoardSale, SimplifiedApexOnBoardSaleSchema } from '@tmlmobilidade/go-types-apex';
import { toUInt64 } from '@tmlmobilidade/utils';

/* * */

export function parseRawApexTransactionSaleV30IntoSimplifiedApexOnBoardSale(doc: RawApexTransactionSaleV30): null | SimplifiedApexOnBoardSale {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromISO(doc.payload.transactionInfo.transactionDate)
		.setZone('Europe/Lisbon', 'rebase_utc');

	//
	// Validate the document structure and content

	const result: SimplifiedApexOnBoardSale = {
		_id: doc.payload.transactionInfo.transactionId,
		agency_id: doc.payload.operatorInfo.operatorLongID,
		apex_version: doc.payload.versionInfo.apexVersion,
		block_id: '',
		card_physical_type: doc.payload.cardInfo.cardPhysicalType,
		card_serial_number: toUInt64(doc.payload.cardInfo.cardSerialNumber),
		created_at: transactionDateValue.unix_timestamp,
		device_id: doc.payload.operatorInfo.deviceID,
		duty_id: '',
		is_passenger: false,
		line_id: '',
		mac_ase_counter_value: doc.payload.mac.aseCounterValue,
		mac_sam_serial_number: doc.payload.mac.samSerialNumber,
		on_board_refund_id: null,
		pattern_id: '',
		payment_method: 0,
		price: 0,
		product_id: '',
		product_quantity: 0,
		received_at: doc.received_at,
		stop_id: '',
		trip_id: '',
		updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
		validation_id: '',
		vehicle_id: 0,
	};

	return SimplifiedApexOnBoardSaleSchema.parse(result);
}
