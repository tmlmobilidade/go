/* * */

import { sams } from '@tmlmobilidade/interfaces';
import { type Sam, UnixTimestamp } from '@tmlmobilidade/types';
import fs from 'node:fs';
import Papa from 'papaparse';

/* * */

interface SamExport {
	_id: number
	agency_id: string
	analysis_apex_version: null | string
	analysis_device_id: null | string
	analysis_end_time: null | UnixTimestamp
	analysis_first_transaction_id: null | string
	analysis_first_transaction_type: null | string
	analysis_last_transaction_id: null | string
	analysis_last_transaction_type: null | string
	analysis_start_time: null | UnixTimestamp
	analysis_transactions_expected: null | number
	analysis_transactions_found: null | number
	analysis_transactions_missing: null | number
	analysis_vehicle_id: null | number
	latest_apex_version: null | string
	remarks: null | string
	seen_first_at: null | number
	seen_last_at: null | number
	system_status: string
	transactions_expected: null | number
	transactions_found: null | number
	transactions_missing: null | number
	updated_at: number
}

/* * */

(async function init() {
	//

	console.log('Starting export-sams...');

	const samsCollection = await sams.getCollection();

	const allSamsStream = samsCollection.find({ agency_id: '41' }).stream();

	//
	// Stream all sams

	const output: SamExport[] = [];

	for await (const sam of allSamsStream) {
		const samData = sam as Sam;
		console.log('Streaming sam:', samData._id, samData.agency_id);
		for (const analysisGroup of samData.analysis) {
			output.push({
				_id: samData._id,
				agency_id: samData.agency_id,
				analysis_apex_version: analysisGroup.apex_version ?? null,
				analysis_device_id: analysisGroup.device_id ?? null,
				analysis_end_time: analysisGroup.end_time ?? null,
				analysis_first_transaction_id: analysisGroup.first_transaction_id ?? null,
				analysis_first_transaction_type: analysisGroup.first_transaction_type ?? null,
				analysis_last_transaction_id: analysisGroup.last_transaction_id ?? null,
				analysis_last_transaction_type: analysisGroup.last_transaction_type ?? null,
				analysis_start_time: analysisGroup.start_time ?? null,
				analysis_transactions_expected: analysisGroup.transactions_expected ?? null,
				analysis_transactions_found: analysisGroup.transactions_found ?? null,
				analysis_transactions_missing: analysisGroup.transactions_missing ?? null,
				analysis_vehicle_id: analysisGroup.vehicle_id ?? null,
				latest_apex_version: samData.latest_apex_version ?? null,
				remarks: samData.remarks ?? null,
				seen_first_at: samData.seen_first_at ?? null,
				seen_last_at: samData.seen_last_at ?? null,
				system_status: samData.system_status ?? null,
				transactions_expected: samData.transactions_expected ?? null,
				transactions_found: samData.transactions_found ?? null,
				transactions_missing: samData.transactions_missing ?? null,
				updated_at: samData.updated_at ?? null,
			});
		}
	}

	//
	// Parse the array with Papaparse and write it to a file

	const outputTxt = Papa.unparse(output);
	fs.writeFileSync('output/sams-41.csv', outputTxt);

	//
})();
