/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type RoutesDetail, RoutesDetailPatternSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { type Route } from '@tmlmobilidade/go-types-offer';

/* * */

/** Populate route responses without storing derived pattern summaries. */
export async function populateRoute(route: Route): Promise<RoutesDetail> {
	//
	// Fetch only the patterns belonging to this route and its parent line.

	const patterns = await goDb.offer.patterns.findMany(
		{ line_id: route.line_id, route_id: route._id },
		{ projection: { _id: 1, code: 1, destination: 1, headsign: 1, line_id: 1, origin: 1, route_id: 1 }, sort: { created_at: -1 } },
	);

	return { ...route, patterns: RoutesDetailPatternSchema.array().parse(patterns) };
}
