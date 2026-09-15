/* * */

import { type FlatSamsAnalysisExportAnalysis } from '@tmlmobilidade/go-types-downloads';
import { type SamAnalysis } from '@tmlmobilidade/go-types-operation';

/* * */

interface ParseAnalysisRow {
	_id?: null | number
	agency_id?: null | string
	analysis: SamAnalysis
}

/* * */

/**
 * Flattens a SAM analysis entry into a CSV row.
 * @param row The SAM identifiers and the analysis entry.
 * @returns The flat analysis row.
 */
export function parseAnalysis(row: ParseAnalysisRow): FlatSamsAnalysisExportAnalysis {
	const { _id, agency_id: agencyId, analysis } = row;

	return {
		_id: _id ?? null,
		agency_id: agencyId ?? null,
		apex_version: analysis.apex_version,
		device_id: analysis.device_id,
		end_time: analysis.end_time,
		first_transaction_ase_counter_value: analysis.first_transaction_ase_counter_value,
		first_transaction_id: analysis.first_transaction_id,
		first_transaction_type: analysis.first_transaction_type,
		last_transaction_ase_counter_value: analysis.last_transaction_ase_counter_value,
		last_transaction_id: analysis.last_transaction_id,
		last_transaction_type: analysis.last_transaction_type,
		start_time: analysis.start_time,
		transactions_expected: analysis.transactions_expected,
		transactions_found: analysis.transactions_found,
		transactions_missing: analysis.transactions_missing,
		vehicle_id: analysis.vehicle_id,
	};
}
