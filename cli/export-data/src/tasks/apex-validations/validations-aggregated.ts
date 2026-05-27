/* * */

import { type TaskProps } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { type Filter, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { type SimplifiedApexValidation } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import fs from 'node:fs';

/* * */

/**
 * Available fields for grouping validations.
 * 'date' is always included by default.
 */
export const validationGroupFields = ['line_id', 'pattern_id', 'product_id', 'trip_id', 'stop_id', 'agency_id', 'vehicle_id'] as const;

export type ValidationGroupField = typeof validationGroupFields[number];

export const validationGroupFieldLabels: Record<ValidationGroupField, string> = {
	agency_id: 'Operador (agency_id)',
	line_id: 'Linha (line_id)',
	pattern_id: 'Pattern (pattern_id)',
	product_id: 'Tipo de passe (product_id)',
	stop_id: 'Paragem (stop_id)',
	trip_id: 'Viagem (trip_id)',
	vehicle_id: 'Veículo (vehicle_id)',
};

/* * */

interface ValidationAggregatedTaskProps extends TaskProps {
	groupFields: ValidationGroupField[]
}

/* * */

/**
 * Export Validations aggregated by user-selected fields.
 * Always groups by date, plus any additional fields selected by the user.
 * The 'validations' count is always included.
 */
export async function exportValidationsAggregated({ context, groupFields, message }: ValidationAggregatedTaskProps): Promise<void> {
	//

	const fieldsList = ['date', ...groupFields].join(', ');
	message(`A iniciar a exportação de Validações APEX agrupadas por: ${fieldsList}...`);

	//
	// Prepare the filter params

	const filterQuery: Filter<SimplifiedApexValidation> = {
		is_passenger: true,
	};

	filterQuery.created_at = {
		$gte: Dates.fromOperationalDate(context.dates.start, 'Europe/Lisbon').unix_timestamp,
		$lt: Dates.fromOperationalDate(context.dates.end, 'Europe/Lisbon').unix_timestamp,
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

	message(`A iniciar ligação à base de dados...`);

	const simplifiedApexValidationsCollection = await simplifiedApexValidations.getCollection();

	const stream = simplifiedApexValidationsCollection.find(filterQuery).stream();

	//
	// Prepare the output directory and CSV writer

	message(`A preparar a pasta para guardar os resultados...`);

	if (!fs.existsSync(context.output)) fs.mkdirSync(context.output, { recursive: true });

	// Build filename based on selected fields
	const fieldsSlug = groupFields.length > 0 ? `by-${groupFields.join('-')}` : 'by-date';
	const csvWriter = new CsvWriter('output', `${context.output}/validations-${fieldsSlug}-${context.dates.start}-${context.dates.end}.csv`, { batch_size: 100000, logs: false });

	//
	// Export the data

	let counter = 0;

	message(`A aguardar o resultado da pesquisa...`);

	const result: Record<string, Record<string, number | string>> = {};

	for await (const doc of stream) {
		const document = doc as SimplifiedApexValidation;

		//
		// Prepare the result key

		const operationalDate = Dates
			.fromUnixTimestamp(document.created_at)
			.setZone('Europe/Lisbon', 'offset_only')
			.operational_date;

		// Build the key from date + all selected group fields
		const keyParts = [operationalDate, ...groupFields.map(field => String(document[field]))];
		const resultKey = keyParts.join(':');

		//
		// Update the result with the current document

		if (!result[resultKey]) {
			// Initialize the result object with date first, then selected fields in order
			const resultObj: Record<string, number | string> = {
				date: operationalDate,
			};

			// Add each selected group field
			for (const field of groupFields) {
				resultObj[field] = document[field];
			}

			// Always add validations count at the end
			resultObj.validations = 0;

			result[resultKey] = resultObj;
		}

		result[resultKey].validations = (result[resultKey].validations as number) + 1;

		if (counter % 1000 === 0) message(`Processados ${counter} documentos até agora...`);
		counter++;

		//
	}

	message(`A escrever os resultados no ficheiro CSV...`);

	// Write results in batches to avoid stack overflow with large datasets
	const writeBatchSize = 10000;
	const resultKeys = Object.keys(result);
	const totalResults = resultKeys.length;

	for (let i = 0; i < totalResults; i += writeBatchSize) {
		const batch = resultKeys.slice(i, i + writeBatchSize).map(key => result[key]);
		await csvWriter.write(batch);

		if (i % 50000 === 0 && i > 0) {
			message(`Escritos ${i} de ${totalResults} resultados...`);
		}
	}

	await csvWriter.flush();

	//
}
