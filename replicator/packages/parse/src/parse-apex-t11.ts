// /* * */

// import { type ApexT11 } from '@tmlmobilidade/types';
// import { Dates } from '@tmlmobilidade/utils';

// /* * */

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function parseApexT11(pcgiDoc: any): ApexT11 {
// 	//

// 	return {
// 		_id: pcgiDoc.transaction.transactionId,
// 		agency_id: pcgiDoc.transaction.operatorLongID,
// 		apex_version: pcgiDoc.transaction.apexVersion,
// 		card_serial_number: pcgiDoc.transaction.cardSerialNumber,
// 		created_at: Dates.fromISO(pcgiDoc.transaction.transactionDate).unix_timestamp,
// 		device_id: pcgiDoc.transaction.deviceID,
// 		line_id: pcgiDoc.transaction.lineLongID,
// 		mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
// 		mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
// 		pattern_id: pcgiDoc.transaction.patternLongID,
// 		product_id: pcgiDoc.transaction.productLongID,
// 		received_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
// 		stop_id: pcgiDoc.transaction.stopLongID,
// 		trip_id: pcgiDoc.transaction.journeyID,
// 		updated_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
// 		validation_status: pcgiDoc.transaction.validationStatus,
// 		vehicle_id: pcgiDoc.transaction.vehicleID,
// 	};

// 	//
// }
