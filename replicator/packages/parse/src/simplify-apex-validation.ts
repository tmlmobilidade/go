/* * */

import { type ApexValidationStatus, type PCGI_ApexTransaction_Validation, type PCGI_TransactionEntity, type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export function simplifyApexValidation(doc: PCGI_TransactionEntity): SimplifiedApexValidation {
	//

	//
	// Extract the decoded transaction from the PCGI document.

	const decodedTransaction: PCGI_ApexTransaction_Validation = JSON.parse(doc.decodeValue);

	//
	// Check if the document is a version 3 transaction.

	if (decodedTransaction.transactionInfo.apexTransactionVersion === '3.0') {
		return {
			//
			_id: decodedTransaction.transactionInfo.transactionId,
			//
			_go_correlation__on_board_refund_id: null,
			_go_correlation__on_board_sale_id: null,
			//
			_go_default__created_at: Dates.fromISO(decodedTransaction.transactionInfo.transactionDate).unix_timestamp,
			_go_default__updated_at: Dates.fromISO(doc.createdAt).unix_timestamp,
			//
			_go_enriched__is_valid: false,
			//
			card_info__card_physical_type: decodedTransaction.cardInfo.cardPhysicalType,
			card_info__card_serial_number: decodedTransaction.cardInfo.cardSerialNumber,
			//
			mac__ase_counter_value: decodedTransaction.mac.aseCounterValue,
			mac__sam_serial_number: decodedTransaction.mac.samSerialNumber,
			//
			operator_info__operator_long_id: decodedTransaction.operatorInfo.operatorLongID,
			//
			service_info__block_id: decodedTransaction.serviceInfo.blockID,
			service_info__duty_id: decodedTransaction.serviceInfo.dutyID,
			service_info__journey_id: decodedTransaction.serviceInfo.journeyID,
			service_info__line_long_id: decodedTransaction.serviceInfo.lineLongID,
			service_info__on_behalf_of_operator_long_id: decodedTransaction.serviceInfo.onBehalfOfOperatorLongID,
			service_info__out_of_bounds_type: decodedTransaction.serviceInfo.outOfBoundsType,
			service_info__pattern_long_id: decodedTransaction.serviceInfo.patternLongID,
			service_info__stop_long_id: decodedTransaction.serviceInfo.stopLongID,
			service_info__validator_id: decodedTransaction.serviceInfo.validatorID,
			service_info__vehicle_id: decodedTransaction.serviceInfo.vehicleID,
			//
			transaction_info__apex_transaction_type: 11,
			transaction_info__transaction_date: decodedTransaction.transactionInfo.transactionDate,
			//
			validation_info__event_type: decodedTransaction.validationInfo.eventType,
			validation_info__product_long_id: decodedTransaction.validationInfo.productLongID,
			validation_info__units_remaining: decodedTransaction.validationInfo.unitsRemaining ?? null,
			validation_info__validation_status: decodedTransaction.validationInfo.validationStatus as ApexValidationStatus,
			validation_info__validation_type: decodedTransaction.validationInfo.validationType,
			//
			version_info__apex_version: decodedTransaction.versionInfo.apexVersion,
			//
		};
	}

	throw new Error(`Unsupported APEX Validation version: ${decodedTransaction.transactionInfo.apexTransactionVersion}. Expected version 3.0.`);

	//
}
