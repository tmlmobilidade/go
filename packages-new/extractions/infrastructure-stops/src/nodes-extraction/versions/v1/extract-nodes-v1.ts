/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsDb } from '@tmlmobilidade/go-interfaces-locationsdb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type ExtractionTaskContext, type ExtractionTaskResult, type InfrastructureNodesV1Extraction, InfrastructureNodesV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { LOCATION_PERMISSION_SLOTS } from '@tmlmobilidade/go-types-locations';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { getCodespacesByMunicipality } from './codespaces.js';
import { toOutputRows } from './transform.js';
import { type InfrastructureNodesV1OutputRow } from './types.js';

/**
 * Exports the permitted stops and their operator identifiers to nodes.txt.
 * @param context The extraction task context.
 * @param extraction The extraction to run.
 */
export async function extractInfrastructureNodesV1(context: ExtractionTaskContext, extraction: InfrastructureNodesV1Extraction): Promise<ExtractionTaskResult> {
	// A. Validate properties and permissions

	const properties = InfrastructureNodesV1ExtractionPropertiesSchema.parse(extraction.properties);
	const permissions = await authProvider.getPermissionsFromUserId(extraction.created_by);
	const checks = [{ action: PermissionCatalog.all.stops.actions.export, scope: PermissionCatalog.all.stops.scope }];
	const agencyAccess = PermissionCatalog.getPermissionResourceAccess({ checks, permissions, resource_key: 'agency_ids' });
	const locationAccess = PermissionCatalog.getPermissionResourceAccess({ checks, permissions, resource_key: 'location_ids' });

	if ((!agencyAccess.allowAll && !agencyAccess.values.length) || (!locationAccess.allowAll && !locationAccess.values.length)) {
		throw new Error('User does not have permission to export stops');
	}

	// B. Fetch stops matching the filters and permissions

	let selectedAgencyIds = agencyAccess.allowAll ? undefined : agencyAccess.values;

	if (properties.agency_ids?.length) {
		selectedAgencyIds = properties.agency_ids.filter(id => agencyAccess.allowAll || agencyAccess.values.includes(id));
	}

	const search = properties.search?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const filters = [
		...[...LOCATION_PERMISSION_SLOTS, 'neighbourhood' as const].flatMap((slot) => {
			const ids = slot === 'secondary'
				? properties.location_secondary_ids ?? properties.municipality_ids
				: properties[`location_${slot}_ids`];
			return ids?.length ? [{ [`location.${slot}.osm_id`]: { $in: ids.map(Number) } }] : [];
		}),
		...(locationAccess.allowAll ? [] : [{
			$or: LOCATION_PERMISSION_SLOTS.map(slot => ({ [`location.${slot}.osm_id`]: { $in: locationAccess.values.map(Number) } })),
		}]),
		...(search ? [{ $or: [{ _id: { $options: 'i', $regex: search } }, { name: { $options: 'i', $regex: search } }] }] : []),
	];

	const [country] = await locationsDb.findLocationsByCountryAndAdminLevel('PT', '2');
	if (!country) throw new Error('Portugal not found in locations database');

	const stops = await goDb.infrastructure.stops.findMany({
		'location.country.osm_id': Number(country.id),
		...(selectedAgencyIds ? { 'flags.agency_ids': { $in: selectedAgencyIds } } : {}),
		...(filters.length ? { $and: filters } : {}),
		...(properties.lifecycle_statuses?.length ? { lifecycle_status: { $in: properties.lifecycle_statuses } } : {}),
		...(properties.facilities?.length ? { facilities: { $in: properties.facilities } } : {}),
		...(properties.connections?.length ? { connections: { $in: properties.connections } } : {}),
		'is_deleted': false,
	}, {
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
