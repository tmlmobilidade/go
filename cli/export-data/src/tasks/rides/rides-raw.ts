/* * */

import { type ExportType, type TaskProps } from '@/types.js';
import { parseRide } from '@/utils/parse-ride.js';
import { type Filter, rides, ridesBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { type Ride, RideAcceptance, RideNormalized } from '@tmlmobilidade/types';
import { CsvWriter } from '@tmlmobilidade/writers';
import fs from 'node:fs';

/* * */

const TASK_ID: ExportType = 'rides-raw';

/* * */

export async function exportRidesRaw({ context, message }: TaskProps): Promise<void> {
	//

	message('A iniciar a exportação de Rides em bruto...');

	//
	// Prepare the filter params

	const filterQuery: Filter<Ride> = {};

	filterQuery.operational_date = {
		$gte: context.dates.start,
		$lte: context.dates.end,
	};

	if (context.filters.agency_ids.length) {
		filterQuery.agency_id = { $in: context.filters.agency_ids };
	}

	if (context.filters.line_ids.length) {
		filterQuery.line_id = { $in: context.filters.line_ids.map(Number) };
	}

	if (context.filters.pattern_ids.length) {
		filterQuery.pattern_id = { $in: context.filters.pattern_ids };
	}

	if (context.filters.vehicle_ids.length) {
		filterQuery.vehicle_ids = { $in: context.filters.vehicle_ids };
	}

	//
	// Setup a database stream to export data

	message(`A iniciar ligação à base de dados...`);

	const ridesCollection = await rides.getCollection();

	const stream = ridesCollection.find(filterQuery).stream();

	//
	// Get the rides batch using native MongoDB cursor with batchSize to prevent memory issues
	const pipeline = ridesBatchAggregationPipeline({
		agency_ids: context.filters.agency_ids,
		line_ids: context.filters.line_ids,
		operational_date_end: context.dates.end,
		operational_date_start: context.dates.start,
		pattern_ids: context.filters.pattern_ids,
		vehicle_ids: context.filters.vehicle_ids,
	});

	//
	// Prepare the output directory and CSV writer

	message(`A preparar a pasta para guardar os resultados...`);

	if (!fs.existsSync(context.output)) fs.mkdirSync(context.output, { recursive: true });

	const csvWriter = new CsvWriter('output', `${context.output}/${TASK_ID}-${context.dates.start}-${context.dates.end}.csv`, { batch_size: 100000, logs: false });

	//
	// Export the data

	let counter = 0;

	message(`A aguardar o resultado da pesquisa...`);

	for await (const doc of stream) {
		const document = doc as RideNormalized;
		await csvWriter.write(parseRide(document as RideNormalized & { acceptance: null | RideAcceptance }));
		if (counter % 1000 === 0) message(`Processados ${counter} documentos até agora...`);
		counter++;
	}

	await csvWriter.flush();

	//
}
