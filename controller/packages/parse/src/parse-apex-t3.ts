/* * */

import { type ApexT3, validateUnixTimestamp } from '@tmlmobilidade/types';
import { DateTime } from 'luxon';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseApexT3(pcgiDoc: any): ApexT3 {
	//

	return {
		_id: pcgiDoc.transaction.transactionId,
		agency_id: pcgiDoc.transaction.operatorLongID,
		apex_version: pcgiDoc.transaction.apexVersion,
		card_serial_number: pcgiDoc.transaction.cardSerialNumber,
		created_at: validateUnixTimestamp(DateTime.fromISO(pcgiDoc.transaction.transactionDate).toMillis()),
		device_id: pcgiDoc.transaction.deviceID,
		invoice_number: pcgiDoc.transaction.invoiceNumber,
		line_id: pcgiDoc.transaction.lineLongID,
		mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
		mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
		payment_method: pcgiDoc.transaction.paymentMethod,
		price: pcgiDoc.transaction.price,
		product_id: pcgiDoc.transaction.productLongID,
		product_qty: pcgiDoc.transaction.productQuantity,
		received_at: validateUnixTimestamp(DateTime.fromISO(pcgiDoc.createdAt).toMillis()),
		units_qty: pcgiDoc.transaction.unitsQuantity,
		updated_at: validateUnixTimestamp(DateTime.fromISO(pcgiDoc.createdAt).toMillis()),
		vehicle_id: pcgiDoc.transaction.vehicleID,
	};

	//
}
