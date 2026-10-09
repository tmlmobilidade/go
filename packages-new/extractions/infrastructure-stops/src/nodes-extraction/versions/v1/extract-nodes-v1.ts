/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type InfrastructureNodesV1Extraction } from '@tmlmobilidade/go-types-extractions';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { buildExtractV1 } from '../../../build-extract-v1.js';
import { getCodespacesByMunicipality } from './codespaces.js';
import { toOutputRows } from './transform.js';
import { type InfrastructureNodesV1OutputRow } from './types.js';

/**
 * Exports the permitted stops and their operator identifiers to nodes.txt.
 * @param context The extraction task context.
 * @param extraction The extraction to run.
 */
export async function extractInfrastructureNodesV1(context: ExtractionTaskContext, extraction: InfrastructureNodesV1Extraction): Promise<ExtractionTaskResult> {
	// A. Prepare the shared filters and permissions

	const { filter, selectedAgencyIds } = await buildExtractV1(extraction);

	// B. Fetch stops matching the filters and permissions

	const stops = await goDb.infrastructure.stops.findMany(filter, {
		projection: { _id: 1, created_at: 1, flags: 1, latitude: 1, location: 1, longitude: 1, name: 1 },
	});

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
				if (!agencyCodesById.has(agencyId)) continue;

				const namespace = codespacesByMunicipality.get(stop.location.secondary.osm_id);
				if (!namespace) throw new Error(`Codespace not found for stop ${stop._id} and municipality ${stop.location.secondary.osm_id}`);

				const operatorStop = { ...stop, flags: [{ ...flag, agency_ids: [agencyId] }] };

				rows.push(...toOutputRows({
					namespace,
					stop: operatorStop,
					valid_from: Dates.fromUnixMilliseconds(stop.created_at).calendar_date,
				}, agencyCodesById));
			}
		}
	}

	const csv = csvStringify(rows, {
		columns: ['operator_id', 'operator_stop_id', 'stop_name', 'lat', 'lon', 'quay_id', 'stop_place_id', 'mode', 'valid_from', 'valid_to'] satisfies (keyof InfrastructureNodesV1OutputRow)[],
		header: true,
	});

	fs.writeFileSync(path.join(context.output_path, 'nodes.txt'), csv, { encoding: 'utf-8', flush: true });
}
