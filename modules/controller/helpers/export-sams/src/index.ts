/* * */

import { sams } from '@tmlmobilidade/go-interfaces';
import { type Sam } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
import fs from 'node:fs';
import Papa from 'papaparse';

/* * */

interface SamExport {
	_id: number
	agency_id: string
	apex_version: null | string
	device_id: null | string
	end_time: null | string
	first_transaction_ase_counter_value: null | number
	first_transaction_id: null | string
	first_transaction_type: null | string
	last_transaction_ase_counter_value: null | number
	last_transaction_id: null | string
	last_transaction_type: null | string
	start_time: null | string
	transactions_expected: null | number
	transactions_found: null | number
	transactions_missing: null | number
	vehicle_id: null | number
}

/* * */

(async function init() {
	//

	console.log('Starting export-sams...');

	const samsCollection = await sams.getCollection();

	const allSamsStream = samsCollection.find({ agency_id: '41', system_status: 'complete' }).stream();

	let totalMissing = 0;

	//
	// Stream all sams

	const output: SamExport[] = [];

	for await (const sam of allSamsStream) {
		const samData = sam as Sam;
		console.log('Streaming sam:', samData._id, samData.agency_id, samData.transactions_expected, samData.transactions_found, samData.transactions_missing);
		for (const analysisGroup of samData.analysis) {
			totalMissing += analysisGroup.transactions_missing ?? 0;
			output.push({
				_id: samData._id,
				agency_id: samData.agency_id,
				apex_version: analysisGroup.apex_version ?? null,
				device_id: analysisGroup.device_id ?? null,
				end_time: analysisGroup.end_time ? Dates.fromUnixTimestamp(analysisGroup.end_time).iso : null,
				first_transaction_ase_counter_value: analysisGroup.first_transaction_ase_counter_value ?? null,
				first_transaction_id: analysisGroup.first_transaction_id ?? null,
				first_transaction_type: analysisGroup.first_transaction_type ?? null,
				last_transaction_ase_counter_value: analysisGroup.last_transaction_ase_counter_value ?? null,
				last_transaction_id: analysisGroup.last_transaction_id ?? null,
				last_transaction_type: analysisGroup.last_transaction_type ?? null,
				start_time: analysisGroup.start_time ? Dates.fromUnixTimestamp(analysisGroup.start_time).iso : null,
				transactions_expected: analysisGroup.transactions_expected ?? null,
				transactions_found: analysisGroup.transactions_found ?? null,
				transactions_missing: analysisGroup.transactions_missing ?? null,
				vehicle_id: analysisGroup.vehicle_id ?? null,
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

	console.log('Total missing:', totalMissing);

	process.exit(0);

	//
})();
