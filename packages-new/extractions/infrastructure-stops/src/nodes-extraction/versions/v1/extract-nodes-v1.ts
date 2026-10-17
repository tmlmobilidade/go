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
	// A. Prepare the shared filters and permissions

	const { filter, projection, selectedAgencyIds } = await buildNodesExtractionQuery(extraction);

	// B. Fetch stops matching the filters and permissions

	const stops = await goDb.infrastructure.stops.findMany(filter, { projection });
	if (!stops.length) throw new Error('No stops found matching the nodes extraction filters');

	for (const stop of stops) {
		stop.flags = stop.flags.map(flag => ({
			...flag,
			agency_ids: flag.agency_ids.filter(id => !selectedAgencyIds || selectedAgencyIds.includes(id)),
		}));
	}

	// C. Fetch operators and municipality codespaces

	const agencyIds = [...new Set(stops.flatMap(stop => stop.flags.flatMap(flag => flag.agency_ids)))];
	const [agencies, codespacesByMunicipality] = await Promise.all([
		goDb.core.agencies.findMany({ _id: { $in: agencyIds } }, { projection: { _id: 1, code: 1 } }),
		getCodespacesByMunicipality(),
	]);
	const agencyCodesById = new Map(agencies.map(agency => [agency._id, agency.code]));

	// D. Generate nodes.txt

	const rows: InfrastructureNodesV1OutputRow[] = [];

	for (const stop of stops) {
		for (const flag of stop.flags) {
			for (const agencyId of flag.agency_ids) {
				const namespace = codespacesByMunicipality.get(stop.location.secondary.osm_id);
				if (!namespace) throw new Error(`Codespace not found for stop ${stop._id} and municipality ${stop.location.secondary.osm_id}`);

				const operatorStop = { ...stop, flags: [{ ...flag, agency_ids: [agencyId] }] };

				rows.push(...parseNodesExtraction({
					namespace,
					stop: operatorStop,
					valid_from: Dates.fromUnixMilliseconds(stop.created_at).calendar_date,
				}, agencyCodesById));
			}
		}
	}

	// E. Validate required fields before writing nodes.txt

	if (!rows.length) throw new Error('No nodes found matching the extraction filters');

	for (const [index, row] of rows.entries()) {
		const invalidFields = Object.entries(row)
			.filter(([field, value]) => field !== 'valid_to' && (
				value === null
				|| value === undefined
				|| (typeof value === 'string' && !value.trim())
				|| (typeof value === 'number' && !Number.isFinite(value))
			))
			.map(([field]) => field);

		if (invalidFields.length) {
			throw new Error(`Nodes row ${index + 1} has empty or invalid required fields: ${invalidFields.join(', ')}`);
		}
	}

	const csv = csvStringify(rows, {
		columns: ['operator_id', 'operator_stop_id', 'stop_name', 'lat', 'lon', 'quay_id', 'stop_place_id', 'mode', 'valid_from', 'valid_to'] satisfies (keyof InfrastructureNodesV1OutputRow)[],
		header: true,
	});

	fs.writeFileSync(path.join(context.output_path, 'nodes.txt'), csv, { encoding: 'utf-8', flush: true });
}
