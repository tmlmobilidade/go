/* * */

import { type ApexT19, type UnixTimestamp } from '@tmlmobilidade/core/types';
import { DateTime } from 'luxon';

/* * */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseApexT19(pcgiDoc: any): ApexT19 {
	//

	return {
		_id: pcgiDoc.transaction.transactionId,
		agency_id: pcgiDoc.transaction.operatorLongID,
		apex_version: pcgiDoc.transaction.apexVersion,
		created_at: DateTime.fromISO(pcgiDoc.transaction.transactionDate).toMillis() as UnixTimestamp,
		device_id: pcgiDoc.transaction.deviceID,
		line_id: pcgiDoc.transaction.lineLongID,
		mac_ase_counter_value: pcgiDoc.transaction.macDataFields.aseCounterValue,
		mac_sam_serial_number: pcgiDoc.transaction.macDataFields.samSerialNumber,
		pattern_id: pcgiDoc.transaction.patternLongID,
		received_at: DateTime.fromISO(pcgiDoc.createdAt).toMillis() as UnixTimestamp,
		stop_id: pcgiDoc.transaction.stopLongID,
		trip_id: pcgiDoc.transaction.journeyID,
		updated_at: DateTime.fromISO(pcgiDoc.createdAt).toMillis() as UnixTimestamp,
		vehicle_id: pcgiDoc.transaction.vehicleID,
	};

	//
}
