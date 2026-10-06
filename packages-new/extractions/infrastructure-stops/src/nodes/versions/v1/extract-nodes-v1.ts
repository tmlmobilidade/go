/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type ExtractionTaskContext, type ExtractionTaskResult, type InfrastructureNodesV1Extraction, InfrastructureNodesV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { LOCATION_PERMISSION_SLOTS } from '@tmlmobilidade/go-types-locations';
import { type TransportType } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { toOutputRows } from './transform.js';

/**
 * Exports the permitted stops and their operator identifiers to node.txt.
 * @param context The extraction task context.
 * @param extraction The extraction to run.
 */
export async function extractInfrastructureNodesV1(context: ExtractionTaskContext, extraction: InfrastructureNodesV1Extraction): Promise<ExtractionTaskResult> {
	const properties = InfrastructureNodesV1ExtractionPropertiesSchema.parse(extraction.properties);
	const permissions = await authProvider.getPermissionsFromUserId(extraction.created_by);
	const checks = [{ action: PermissionCatalog.all.stops.actions.export, scope: PermissionCatalog.all.stops.scope }];
	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({ checks, permissions, resource_key: 'agency_ids' });
	const locationAccess = PermissionCatalog.getPermissionResourceAccess({ checks, permissions, resource_key: 'location_ids' });

	if ((!agencyAccess.allowAll && !agencyAccess.values.length) || (!locationAccess.allowAll && !locationAccess.values.length)) {
		throw new Error('User does not have permission to export stops');
	}

	const stops = await goDb.infrastructure.stops.findMany({
		...(agencyAccess.allowAll ? {} : { 'flags.agency_ids': { $in: agencyAccess.values } }),
		...(locationAccess.allowAll ? {} : {
			$or: LOCATION_PERMISSION_SLOTS.map(slot => ({
				[`location.${slot}.osm_id`]: { $in: locationAccess.values.map(Number) },
			})),
		}),
		...(properties.municipality_ids?.length ? { 'location.secondary.osm_id': { $in: properties.municipality_ids.map(Number) } } : {}),
		is_deleted: false,
	}, {
		projection: { _id: 1, flags: 1, latitude: 1, longitude: 1, name: 1 },
	});

	for (const stop of stops) {
		stop.flags = stop.flags.map(flag => ({
			...flag,
			agency_ids: flag.agency_ids.filter(id => agencyAccess.allowAll || agencyAccess.values.includes(id)),
		}));
	}

	const agencyIds = [...new Set(stops.flatMap(stop => stop.flags.flatMap(flag => flag.agency_ids)))];
	const [agencies, lines] = await Promise.all([
		goDb.core.agencies.findMany({ _id: { $in: agencyIds } }, { projection: { _id: 1, code: 1 } }),
		goDb.offer.lines.findMany({ agency_id: { $in: agencyIds } }, { projection: { _id: 1, agency_id: 1, transport_type: 1 } }),
	]);
	const agencyCodesById = new Map(agencies.map(agency => [agency._id, agency.code]));
	const linesById = new Map(lines.map(line => [line._id, line]));
	const patterns = await goDb.offer.patterns.findMany({
		'line_id': { $in: lines.map(line => line._id) },
		'path.stop_id': { $in: stops.flatMap(stop => [stop._id, Number(stop._id)]) },
	}, {
		projection: { 'line_id': 1, 'path.stop_id': 1 },
	});
	const modesByStopAndAgency = new Map<string, Set<TransportType>>();

	for (const pattern of patterns) {
		const line = linesById.get(pattern.line_id);
		if (!line) continue;

		for (const item of pattern.path ?? []) {
			const key = `${item.stop_id}:${line.agency_id}`;
			const modes = modesByStopAndAgency.get(key) ?? new Set<TransportType>();
			modes.add(line.transport_type);
			modesByStopAndAgency.set(key, modes);
		}
	}

	const rows = stops.flatMap(stop => stop.flags.flatMap(flag => flag.agency_ids.flatMap((agencyId) => {
		if (!agencyCodesById.has(agencyId)) return [];

		const modes = modesByStopAndAgency.get(`${stop._id}:${agencyId}`);

		return [...(modes ?? ['' as const])].flatMap(mode => toOutputRows({
			// Parent stations are not yet available through goDb.
			has_parent_station: false,
			mode,
			stop: { ...stop, flags: [{ ...flag, agency_ids: [agencyId] }] },
			// Stop flags do not currently contain association validity dates.
			valid_from: '',
		}, agencyCodesById));
	})));

	if (!rows.length) return;

	fs.writeFileSync(path.join(context.output_path, 'node.txt'), csvStringify(rows, { header: true }), { encoding: 'utf-8', flush: true });
}
