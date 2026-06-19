/* * */

import { Dates } from '@tmlmobilidade/dates';
import { ApexCardTypeSchema, ApexPaymentMethodSchema, type RawApexTransactionRefundV30, type SimplifiedApexOnBoardRefund, SimplifiedApexOnBoardRefundSchema } from '@tmlmobilidade/go-types-apex';
import { toUInt64 } from '@tmlmobilidade/utils';

/* * */

export function parseRawApexTransactionRefundV30IntoSimplifiedApexOnBoardRefund(doc: RawApexTransactionRefundV30): null | SimplifiedApexOnBoardRefund {
	//

	//
	// Prepare the date field values

	const transactionDateValue = Dates
		.fromFormat(doc.payload.transactionInfo.transactionDate, 'yyyy-MM-dd\'T\'HH:mm:ss', 'Europe/Lisbon');

	//
	// Validate the document structure and content

	const result: SimplifiedApexOnBoardRefund = {
		_id: doc.payload.transactionInfo.transactionId,
		agency_id: doc.payload.operatorInfo.operatorLongID,
		apex_version: doc.payload.versionInfo.apexVersion,
		card_physical_type: ApexCardTypeSchema.parse(String(doc.payload.cardInfo.cardPhysicalType)),
		card_serial_number: toUInt64(doc.payload.cardInfo.cardSerialNumber),
		device_id: doc.payload.operatorInfo.deviceID,
		is_ok: false,
		is_ok_pcgi: doc.is_ok,
		line_id: null,
		mac_ase_counter_value: doc.payload.mac.aseCounterValue,
		mac_sam_serial_number: doc.payload.mac.samSerialNumber,
		on_board_sale_id: doc.payload.loadCorrInfo.corrTransactionId,
		operational_date: transactionDateValue.operational_date_int,
		pattern_id: null,
		payment_method: ApexPaymentMethodSchema.parse(String(doc.payload.paymentInfo.paymentMethod)),
		price: doc.payload.paymentInfo.price,
		product_id: doc.payload.saleLoadInfo.productLongID,
		product_quantity: doc.payload.saleLoadInfo.productQuantity,
		received_at: doc.received_at,
		stop_id: null,
		transaction_date: transactionDateValue.unix_timestamp,
		trip_id: null,
		updated_at: Dates.now('utc').unix_timestamp,
		validation_id: null,
		vehicle_id: null,
	};

	return SimplifiedApexOnBoardRefundSchema.parse(result);
}
