/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type RawApexTransactionRefundV30, type SimplifiedApexOnBoardRefund, SimplifiedApexOnBoardRefundSchema } from '@tmlmobilidade/go-types-apex';
import { toUInt64 } from '@tmlmobilidade/utils';

/* * */

export function parseRawApexTransactionRefundV30IntoSimplifiedApexOnBoardRefund(doc: RawApexTransactionRefundV30): null | SimplifiedApexOnBoardRefund {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromISO(doc.payload.transactionInfo.transactionDate)
		.setZone('utc', 'rebase_utc');

	//
	// Validate the document structure and content

	const result: SimplifiedApexOnBoardRefund = {
		_id: doc.payload.transactionInfo.transactionId,
		agency_id: doc.payload.operatorInfo.operatorLongID,
		apex_version: doc.payload.versionInfo.apexVersion,
		block_id: null,
		card_physical_type: doc.payload.cardInfo.cardPhysicalType,
		card_serial_number: toUInt64(doc.payload.cardInfo.cardSerialNumber),
		created_at: transactionDateValue.unix_timestamp,
		device_id: doc.payload.operatorInfo.deviceID,
		duty_id: null,
		line_id: null,
		mac_ase_counter_value: doc.payload.mac.aseCounterValue,
		mac_sam_serial_number: doc.payload.mac.samSerialNumber,
		on_board_sale_id: doc.payload.loadCorrInfo.corrTransactionId,
		pattern_id: null,
		payment_method: doc.payload.paymentInfo.paymentMethod,
		price: doc.payload.paymentInfo.price,
		product_id: doc.payload.saleLoadInfo.productLongID,
		product_quantity: doc.payload.saleLoadInfo.productQuantity,
		received_at: doc.received_at,
		stop_id: null,
		trip_id: null,
		updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
		validation_id: null,
		vehicle_id: null,
	};

	return SimplifiedApexOnBoardRefundSchema.parse(result);
}
