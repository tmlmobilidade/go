/* * */

import { type ApexTransactionEntity } from '@tmlmobilidade/sae-replicator-pckg-utils';
import { type ApexValidation } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function parseApexValidation(doc: ApexTransactionEntity): ApexValidation {
	//

	const decodedTransaction = JSON.parse(doc.decodeValue);

	return {
		//
		_id: doc.transactionId,
		//
		is_valid: false,
		//
		agency_id: doc.operatorLongId,
		apex_transaction_type: pcgiDoc.transaction.apexTransactionType,
		apex_version: pcgiDoc.transaction.apexVersion,
		device_id: pcgiDoc.transaction.deviceID,
		mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
		mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
		//
		created_at: Dates.fromISO(pcgiDoc.transaction.transactionDate).unix_timestamp,
		received_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
		updated_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
		//
		line_id: pcgiDoc.transaction.lineLongID,
		pattern_id: pcgiDoc.transaction.patternLongID,
		stop_id: pcgiDoc.transaction.stopLongID,
		trip_id: pcgiDoc.transaction.journeyID,
		vehicle_id: pcgiDoc.transaction.vehicleID,
		//
		card_physical_type: pcgiDoc.transaction.cardPhysicalType,
		card_serial_number: pcgiDoc.transaction.cardSerialNumber,
		card_type_id: pcgiDoc.transaction.cardTypeID,
		event_type: pcgiDoc.transaction.eventType,
		product_id: pcgiDoc.transaction.productLongID,
		product_type: pcgiDoc.transaction.productType,
		units_qty: pcgiDoc.transaction.productQuantity,
		validation_status: pcgiDoc.transaction.validationStatus,
		//
		on_board_sale_transaction_id: undefined,
		refund_transaction_id: undefined,
		//
	};

	//
}
