/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type InfrastructureNodesV1Extraction } from '@tmlmobilidade/go-types-extractions';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { buildNodesExtractionQuery } from './apply-query.js';
import { getCodespacesByMunicipality } from './codespaces.js';
import { parseNodesExtraction } from './transform.js';
import { type InfrastructureNodesV1OutputRow } from './types.js';

/**
 * Exports the permitted stops and their operator identifiers to nodes.txt.
 * @param context The extraction task context.
 * @param extraction The extraction to run.
 */
export async function extractInfrastructureNodesV1(context: ExtractionTaskContext, extraction: InfrastructureNodesV1Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// Prepare filters and permissions

	const { filter, projection, selectedAgencyIds } = await buildNodesExtractionQuery(extraction);

	//
	// Fetch stops matching the filters and permissions

	const foundStops = await goDb.infrastructure.stops.findMany(filter, { projection });
	if (!foundStops.length) throw new Error('No stops found matching the nodes extraction filters');

	//
	// Keep the selected agencies in each stop flag

	for (const stop of foundStops) {
		stop.flags = stop.flags.map((stopFlag) => {
			const selectedFlagAgencyIds = stopFlag.agency_ids.filter(agencyId => !selectedAgencyIds || selectedAgencyIds.includes(agencyId));

			return {
				...stopFlag,
				agency_ids: selectedFlagAgencyIds,
			};
		});
	}

	//
	// Fetch operators and municipality codespaces

	const stopFlags = foundStops.flatMap(stop => stop.flags);
	const flagAgencyIds = stopFlags.flatMap(stopFlag => stopFlag.agency_ids);
	const uniqueAgencyIds = [...new Set(flagAgencyIds)];

	const [agencies, codespacesByMunicipality] = await Promise.all([
		goDb.core.agencies.findMany({ _id: { $in: uniqueAgencyIds } }, { projection: { _id: 1, code: 1 } }),
		getCodespacesByMunicipality(),
	]);
	const agencyCodesById = new Map(agencies.map(agency => [agency._id, agency.code]));

	//
	// Build nodes.txt rows

	const outputRows: InfrastructureNodesV1OutputRow[] = [];

	for (const stop of foundStops) {
		for (const stopFlag of stop.flags) {
			for (const agencyId of stopFlag.agency_ids) {
				const municipalityOsmId = stop.location.secondary.osm_id;
				const namespace = codespacesByMunicipality.get(municipalityOsmId);
				if (!namespace) throw new Error(`Codespace not found for stop ${stop._id} and municipality ${municipalityOsmId}`);

				const operatorFlag = { ...stopFlag, agency_ids: [agencyId] };
				const operatorStop = { ...stop, flags: [operatorFlag] };
				const validFrom = Dates.fromUnixMilliseconds(stop.created_at).calendar_date;

				const operatorRows = parseNodesExtraction({
					namespace,
					stop: operatorStop,
					valid_from: validFrom,
				}, agencyCodesById);

				outputRows.push(...operatorRows);
			}
		}
	}

	//
	// Validate required fields before writing nodes.txt

	if (!outputRows.length) throw new Error('No nodes found matching the extraction filters');

	for (const [rowIndex, outputRow] of outputRows.entries()) {
		const invalidFieldNames: string[] = [];

		for (const [fieldName, fieldValue] of Object.entries(outputRow)) {
			if (fieldName === 'valid_to') continue;

			const isMissing = fieldValue === null || fieldValue === undefined;
			const isBlankString = typeof fieldValue === 'string' && !fieldValue.trim();
			const isInvalidNumber = typeof fieldValue === 'number' && !Number.isFinite(fieldValue);

			if (isMissing || isBlankString || isInvalidNumber) {
				invalidFieldNames.push(fieldName);
			}
		}

		if (invalidFieldNames.length) {
			throw new Error(`Nodes row ${rowIndex + 1} has empty or invalid required fields: ${invalidFieldNames.join(', ')}`);
		}
	}

	//
	// Write nodes.txt

	const csvContent = csvStringify(outputRows, {
		columns: [
			'operator_id',
			'operator_stop_id',
			'stop_name',
			'lat',
			'lon',
			'quay_id',
			'stop_place_id',
			'mode',
			'valid_from',
			'valid_to',
		] satisfies (keyof InfrastructureNodesV1OutputRow)[],
		header: true,
	});

	const outputFilePath = path.join(context.output_path, 'nodes.txt');
	fs.writeFileSync(outputFilePath, csvContent, { encoding: 'utf-8', flush: true });
}
