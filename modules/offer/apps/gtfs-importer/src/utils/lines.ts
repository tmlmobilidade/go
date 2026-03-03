import { CreateLineDto, GtfsTMLRoute, INTERCHANGE_MODE, transportTypeMapper, Typology } from '@tmlmobilidade/types';

import { normalizeHexColor } from './typology.js';

/**
 * Resolve the canonical line code from a GTFS route row.
 * Used both for grouping routes by line and for creating the line document.
 */
export function resolveLineCode(route: GtfsTMLRoute): string {
	return String(route.line_id).trim();
}

export function buildLineFromRoute(route: GtfsTMLRoute, agencyId: string, typologyMap: Map<string, Typology>, routeColor?: string, interchangeMode?: typeof INTERCHANGE_MODE[keyof typeof INTERCHANGE_MODE]): CreateLineDto {
	const lineCode = resolveLineCode(route);
	const lineName = route.line_long_name || route.route_long_name || route.line_short_name || route.route_short_name || route.route_id;
	const typology = routeColor ? typologyMap.get(normalizeHexColor(routeColor) ?? '') : undefined;

	return {
		agency_id: agencyId,
		code: lineCode,
		created_by: 'system',
		interchange: interchangeMode,
		is_circular_line: route.circular === 1,
		is_locked: false,
		is_school_line: route.school === 1,
		name: lineName,
		onboard_fare_ids: typology?.default_onboard_fare_ids ?? [],
		prepaid_fare_id: typology?.default_prepaid_fare_id ?? null,
		transport_type: transportTypeMapper.fromGtfs(route.route_type) || 'bus',
		typology: typology?._id ?? null,
	};
}
