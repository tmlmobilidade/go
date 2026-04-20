/* * */

import { parseSamsDeviceSearch, parseSamsVehicleSearch } from '@/interfaces/sams/regex-search.js';
import { type GetSamsBatchQuery, PermissionCatalog } from '@tmlmobilidade/types';

/* * */

/**
 * Escapes a regex string.
 */
function escapeRegex(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Reserved query fields that are not used in the aggregation pipeline.
 */
const RESERVED_QUERY_FIELDS = new Set(['agency_ids', 'limit', 'offset', 'search']);
const RANGE_QUERY_FIELDS = {
	seen_first_at: { field: 'seen_first_at', operator: '$gte' },
	seen_last_at: { field: 'seen_last_at', operator: '$lte' },
} as const;

/**
 * Builds `$match` AND clauses for SAM list / export from a parsed batch query (same semantics as the controller list).
 */
export function buildSamsMatch(parsedQuery: GetSamsBatchQuery, options: { includeApexVersionFilter?: boolean } = {}): Record<string, unknown>[] {
	const { includeApexVersionFilter = true } = options;
	const matchAnd: Record<string, unknown>[] = [];

	const agencyIdsForMatch = parsedQuery.agency_ids.filter(
		id => id !== PermissionCatalog.ALLOW_ALL_FLAG,
	);
	if (agencyIdsForMatch.length > 0) {
		matchAnd.push({ agency_id: { $in: agencyIdsForMatch } });
	}

	const searchRaw = parsedQuery.search?.trim() ?? '';
	if (searchRaw.length > 0) {
		const vehicleIds = parseSamsVehicleSearch(searchRaw);
		if (vehicleIds.length > 0) {
			matchAnd.push({
				$or: [
					{ vehicle_id: { $in: vehicleIds } },
					{ 'analysis.vehicle_id': { $in: vehicleIds } },
				],
			});
		} else {
			const deviceIds = parseSamsDeviceSearch(searchRaw);
			if (deviceIds.length > 0) {
				matchAnd.push({
					$or: [
						{ device_id: { $in: deviceIds } },
						{ 'analysis.device_id': { $in: deviceIds } },
					],
				});
			} else {
				const escaped = escapeRegex(searchRaw);
				matchAnd.push({
					$or: [
						{ $expr: { $regexMatch: { input: { $toString: '$_id' }, options: 'i', regex: escaped } } },
						{ agency_id: { $options: 'i', $regex: escaped } },
						{ 'analysis.first_transaction_id': { $options: 'i', $regex: escaped } },
						{ 'analysis.last_transaction_id': { $options: 'i', $regex: escaped } },
					],
				});
			}
		}
	}

	for (const [key, value] of Object.entries(parsedQuery)) {
		if (RESERVED_QUERY_FIELDS.has(key) || value === undefined || value === null || value === '')
			continue;
		if (!includeApexVersionFilter && key === 'latest_apex_version')
			continue;

		if (key in RANGE_QUERY_FIELDS) {
			const rangeKey = key as keyof typeof RANGE_QUERY_FIELDS;
			const rangeConfig = RANGE_QUERY_FIELDS[rangeKey];
			matchAnd.push({ [rangeConfig.field]: { [rangeConfig.operator]: value } });
			continue;
		}

		if (Array.isArray(value)) {
			if (value.length > 0) {
				if (key === 'latest_apex_version') {
					matchAnd.push({ latest_apex_version: { $in: value } });
					continue;
				}
				matchAnd.push({ [key]: { $in: value } });
			}
			continue;
		}

		matchAnd.push({ [key]: value });
	}

	return matchAnd;
}
