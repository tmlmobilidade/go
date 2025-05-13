// /* * */

// import { type ApexT19 } from '@tmlmobilidade/types';
// import { Dates } from '@tmlmobilidade/utils';

// /* * */

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function parseApexT19(pcgiDoc: any): ApexT19 {
// 	//

// 	return {
// 		_id: pcgiDoc.transaction.transactionId,
// 		agency_id: pcgiDoc.transaction.operatorLongID,
// 		apex_version: pcgiDoc.transaction.apexVersion,
// 		created_at: Dates.fromISO(pcgiDoc.transaction.transactionDate).unix_timestamp,
// 		device_id: pcgiDoc.transaction.deviceID,
// 		line_id: pcgiDoc.transaction.lineLongID,
// 		mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
// 		mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
// 		pattern_id: pcgiDoc.transaction.patternLongID,
// 		received_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
// 		stop_id: pcgiDoc.transaction.stopLongID,
// 		trip_id: pcgiDoc.transaction.journeyID,
// 		updated_at: Dates.fromISO(pcgiDoc.createdAt).unix_timestamp,
// 		vehicle_id: pcgiDoc.transaction.vehicleID,
// 	};

// 	//
// }
