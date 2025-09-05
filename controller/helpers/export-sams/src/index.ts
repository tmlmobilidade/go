/* * */

import { sams } from '@tmlmobilidade/interfaces';
import { type Sam } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
import fs from 'node:fs';
import Papa from 'papaparse';

/* * */

interface SamExport {
	_id: number
	agency_id: string
	analysis_apex_version: null | string
	analysis_device_id: null | string
	analysis_end_time: null | string
	analysis_first_transaction_id: null | string
	analysis_first_transaction_type: null | string
	analysis_last_transaction_id: null | string
	analysis_last_transaction_type: null | string
	analysis_start_time: null | string
	analysis_transactions_expected: null | number
	analysis_transactions_found: null | number
	analysis_transactions_missing: null | number
	analysis_vehicle_id: null | number
}

/* * */

(async function init() {
	//

	console.log('Starting export-sams...');

	const samsCollection = await sams.getCollection();

	const allSamsStream = samsCollection.find({ agency_id: '41', system_status: 'complete' }).stream();

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
				analysis_end_time: analysisGroup.end_time ? Dates.fromUnixTimestamp(analysisGroup.end_time).iso : null,
				analysis_first_transaction_id: analysisGroup.first_transaction_id ?? null,
				analysis_first_transaction_type: analysisGroup.first_transaction_type ?? null,
				analysis_last_transaction_id: analysisGroup.last_transaction_id ?? null,
				analysis_last_transaction_type: analysisGroup.last_transaction_type ?? null,
				analysis_start_time: analysisGroup.start_time ? Dates.fromUnixTimestamp(analysisGroup.start_time).iso : null,
				analysis_transactions_expected: analysisGroup.transactions_expected ?? null,
				analysis_transactions_found: analysisGroup.transactions_found ?? null,
				analysis_transactions_missing: analysisGroup.transactions_missing ?? null,
				analysis_vehicle_id: analysisGroup.vehicle_id ?? null,
			});
		}
	}

	//
	// Parse the array with Papaparse and write it to a file

	if (!fs.existsSync('output')) {
		fs.mkdirSync('output');
	}

	console.log(`Exporting ${output.length} rows...`);

	const outputTxt = Papa.unparse(output);
	fs.writeFileSync('output/sams-41.csv', outputTxt);

	console.log('Done.');

	process.exit(0);

	//
})();
