/* * */

import { parseCsv, readGtfsFile, toNumberOrNull } from '@/helpers/index.js';
import { CreateRouteDto, GtfsTMLRoute, GtfsTMLRouteSchema, pathTypeMapper } from '@tmlmobilidade/types';

/* * */

export async function loadGtfsRoutes(gtfsPath: string) {
	const content = await readGtfsFile(gtfsPath, 'routes.txt');
	const rawRoutes = parseCsv<GtfsTMLRoute>(content);
	const routes: GtfsTMLRoute[] = [];

	for (const raw of rawRoutes) {
		try {
			const normalized = {
				...raw,
				circular: toNumberOrNull(raw.circular),
				line_id: toNumberOrNull(raw.line_id),
				line_type: toNumberOrNull(raw.line_type),
				school: toNumberOrNull(raw.school),
			} as GtfsTMLRoute;
			routes.push(GtfsTMLRouteSchema.parse(normalized));
		} catch (error) {
			console.warn(`Skipping route due to validation error: ${error instanceof Error ? error.message : String(error)}`);
		}
	}

	return routes;
}

export function buildRoutesForLine(
	lineId: string,
	lineName: string,
	lineRoutes: GtfsTMLRoute[] = [],
): CreateRouteDto[] {
	if (lineRoutes.length) {
		const uniqueByRouteId = new Map<string, GtfsTMLRoute>();
		for (const route of lineRoutes) {
			if (!uniqueByRouteId.has(route.route_id)) uniqueByRouteId.set(route.route_id, route);
		}
		return [...uniqueByRouteId.values()].map((route) => {
			const routeName = route.route_long_name || route.route_short_name || lineName;
			return {
				code: route.route_id,
				created_by: 'system',
				is_locked: false,
				line_id: lineId,
				name: routeName,
				path_type: pathTypeMapper.fromGtfs(route.path_type),
			};
		});
	}
}
