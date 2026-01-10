/* * */

import { type SamExport } from '@/tasks/sams/sams-raw.types.js';
import { type ExportType, type TaskProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { type Filter, sams } from '@tmlmobilidade/interfaces';
import { type Sam } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import fs from 'node:fs';

/* * */

const TASK_ID: ExportType = 'sams-raw';

/* * */

export async function exportSamsRaw({ context, message }: TaskProps): Promise<void> {
	//

	message('A iniciar a exportação de SAMs em bruto...');

	//
	// Prepare the filter params

	const filterQuery: Filter<Sam> = {};

	if (context.filters.agency_ids.length) {
		filterQuery.agency_id = { $in: context.filters.agency_ids };
	}

	//
	// Setup a database stream to export data

	message(`A iniciar ligação à base de dados...`);

	const samsCollection = await sams.getCollection();

	const stream = samsCollection.find(filterQuery).stream();

	//
	// Prepare the output directory and CSV writer

	message(`A preparar a pasta para guardar os resultados...`);

	if (!fs.existsSync(context.output)) fs.mkdirSync(context.output, { recursive: true });

	const csvWriter = new CsvWriter<SamExport>('output', `${context.output}/${TASK_ID}-${context.dates.start}-${context.dates.end}.csv`, { batch_size: 100000, logs: false });

	//
	// Export the data

	let counter = 0;

	message(`A aguardar o resultado da pesquisa...`);

	for await (const doc of stream) {
		const document = doc as Sam;
		for (const analysisGroup of document.analysis) {
			await csvWriter.write({
				_id: document._id,
				agency_id: document.agency_id,
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
		if (counter % 1000 === 0) message(`Processados ${counter} documentos até agora...`);
		counter++;
	}

	await csvWriter.flush();

	//
}
