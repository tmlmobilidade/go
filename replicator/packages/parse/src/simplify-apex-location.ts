/* * */

import { PCGI_ApexTransaction_Location, type PCGI_TransactionEntity, type SimplifiedApexLocation } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function simplifyApexLocation(doc: PCGI_TransactionEntity): SimplifiedApexLocation {
	//

	//
	// Extract the decoded transaction from the PCGI document.

	const decodedTransaction: PCGI_ApexTransaction_Location = JSON.parse(doc.decodeValue);

	//
	// Check if the document is a version 3 transaction.

	if (decodedTransaction.transactionInfo.apexTransactionVersion === '2.0') {
		return {
			//
			_id: decodedTransaction.transactionInfo.transactionId,
			//
			_go_default__created_at: Dates.fromISO(decodedTransaction.transactionInfo.transactionDate).unix_timestamp,
			_go_default__updated_at: Dates.fromISO(doc.createdAt).unix_timestamp,
			//
			mac__ase_counter_value: decodedTransaction.mac.aseCounterValue,
			mac__sam_serial_number: decodedTransaction.mac.samSerialNumber,
			//
			operator_info__operator_long_id: decodedTransaction.operatorInfo.operatorLongID,
			//
			transaction_info__apex_transaction_type: 19,
			transaction_info__transaction_date: decodedTransaction.transactionInfo.transactionDate,
			//
			validation_service_info__block_id: decodedTransaction.validationServiceInfo.blockID,
			validation_service_info__duty_id: decodedTransaction.validationServiceInfo.dutyID,
			validation_service_info__journey_id: decodedTransaction.validationServiceInfo.journeyID,
			validation_service_info__line_long_id: decodedTransaction.validationServiceInfo.lineLongID,
			validation_service_info__on_behalf_of_operator_long_id: decodedTransaction.validationServiceInfo.onBehalfOfOperatorLongID,
			validation_service_info__operation_plan_id: decodedTransaction.validationServiceInfo.operationPlanID,
			validation_service_info__out_of_bounds_type: decodedTransaction.validationServiceInfo.outOfBoundsType,
			validation_service_info__pattern_long_id: decodedTransaction.validationServiceInfo.patternLongID,
			validation_service_info__stop_long_id: decodedTransaction.validationServiceInfo.stopLongID,
			validation_service_info__validator_id: decodedTransaction.validationServiceInfo.validatorID,
			validation_service_info__vehicle_id: decodedTransaction.validationServiceInfo.vehicleID,
			//
			version_info__apex_version: decodedTransaction.versionInfo.apexVersion,
			//
		};
	}

	throw new Error(`Unsupported APEX Location version: ${decodedTransaction.transactionInfo.apexTransactionVersion}. Expected version 2.0.`);

	//
}
