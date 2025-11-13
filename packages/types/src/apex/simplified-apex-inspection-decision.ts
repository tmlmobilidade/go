/* * */

import { type UnixTimestamp } from '@/_common/unix-timestamp.js';

/**
 * APEX Inspection Decisions are APEX transactions.
 */
export interface SimplifiedApexInspectionDecision {

	_go_default__created_at: UnixTimestamp
	_go_default__updated_at: UnixTimestamp

	_id: string

	mac__ase_counter_value: number
	mac__sam_serial_number: number

	operator_info__operator_long_id: string

	transaction_info__apex_transaction_type: 6
	transaction_info__transaction_date: string

	version_info__apex_version: string

}
