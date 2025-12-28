/* * */

import { type TaskProps } from '@/types/init.js';
import { Dates } from '@tmlmobilidade/dates';
import { Filter, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Timer } from '@tmlmobilidade/timer';
import { SimplifiedApexValidation } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import fs from 'node:fs';

/**
 * Export Validations Raw data applying the given filters.
 */
export async function exportValidationsRaw({ context, message }: TaskProps): Promise<void> {
	//

	const timer = new Timer();

	message('A iniciar a exportação de Validações APEX em bruto...');

	//
	// Prepare the filter params

	const filterQuery: Filter<SimplifiedApexValidation> = {};

	filterQuery.created_at = {
		$gte: Dates
			.fromOperationalDate(context.dates.start, 'Europe/Lisbon')
			.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
			.unix_timestamp,
		$lt: Dates
			.fromOperationalDate(context.dates.end, 'Europe/Lisbon')
			.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
			.unix_timestamp,
	};

	if (context.filters.agency_ids.length) {
		filterQuery.agency_id = { $in: context.filters.agency_ids };
	}

	if (context.filters.line_ids.length) {
		filterQuery.line_id = { $in: context.filters.line_ids };
	}

	if (context.filters.pattern_ids.length) {
		filterQuery.pattern_id = { $in: context.filters.pattern_ids };
	}

	if (context.filters.stop_ids.length) {
		filterQuery.stop_id = { $in: context.filters.stop_ids };
	}

	if (context.filters.vehicle_ids.length) {
		filterQuery.vehicle_id = { $in: context.filters.vehicle_ids };
	}

	//
	// Setup a database stream to export data

	const simplifiedApexValidationsCollection = await simplifiedApexValidations.getCollection();

	const stream = simplifiedApexValidationsCollection.find(filterQuery).stream();

	if (!fs.existsSync(context.output)) fs.mkdirSync(context.output, { recursive: true });

	const csvWriter = new CsvWriter('output', `${context.output}/apex-validations-${context.dates.start}-${context.dates.end}.csv`, { batch_size: 100000, logs: false });

	for await (const validation of stream) {
		message(`Exporting validation ID: ${validation._id}`);
		await csvWriter.write(validation);
	}

	await csvWriter.flush();

	//
}
