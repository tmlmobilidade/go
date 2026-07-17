/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { fares, typologies } from '@tmlmobilidade/interfaces';
import { type Fare, type FareSimplified, type Line, type LineNormalized, type Route, type RouteSimplified, type Typology, type TypologySimplified } from '@tmlmobilidade/types';

/* * */

function toTypologySimplified(typology: Typology): TypologySimplified {
	return {
		_id: typology._id,
		code: typology.code,
		color: typology.color,
		default_onboard_fare_ids: typology.default_onboard_fare_ids,
		default_prepaid_fare_id: typology.default_prepaid_fare_id,
		name: typology.name,
		text_color: typology.text_color,
	};
}

function toFareSimplified(fare: Fare): FareSimplified {
	return {
		_id: fare._id,
		name: fare.name,
		payment_method: fare.payment_method,
	};
}

async function getLinesRoutes(lineIds: string[]): Promise<(Pick<Route, 'line_id'> & RouteSimplified)[]> {
	if (!lineIds.length) return [];

	return await goDb.offer.routes.findMany(
		{ line_id: { $in: lineIds } },
		{ projection: { _id: 1, code: 1, line_id: 1, name: 1 }, sort: { created_at: -1 } },
	) as (Pick<Route, 'line_id'> & RouteSimplified)[];
}

export async function populateLines(linesData: Line[]): Promise<LineNormalized[]> {
	if (!linesData.length) return [];

	const typologyIds = [...new Set(linesData.map(line => line.typology).filter(Boolean))] as string[];
	const fareIds = [...new Set([
		...linesData.map(line => line.prepaid_fare_id).filter(Boolean),
		...linesData.flatMap(line => line.onboard_fare_ids ?? []),
	])] as string[];

	const [typologiesData, faresData] = await Promise.all([
		typologyIds.length
			? typologies.findMany({ _id: { $in: typologyIds } })
			: Promise.resolve([]),
		fareIds.length
			? fares.findMany({ _id: { $in: fareIds } })
			: Promise.resolve([]),
	]);
	const routesData = await getLinesRoutes(linesData.map(line => line._id));

	const typologyById = new Map(typologiesData.map(typology => [typology._id, typology]));
	const fareById = new Map(faresData.map(fare => [fare._id, fare]));
	const routesByLineId = new Map<string, RouteSimplified[]>();

	for (const route of routesData) {
		const lineRoutes = routesByLineId.get(route.line_id) ?? [];
		lineRoutes.push({
			_id: route._id,
			code: route.code,
			name: route.name,
		});
		routesByLineId.set(route.line_id, lineRoutes);
	}

	return linesData.map((line) => {
		const typology = line.typology ? typologyById.get(line.typology) : undefined;
		const prepaidFare = line.prepaid_fare_id ? fareById.get(line.prepaid_fare_id) : undefined;
		const onboardFares = (line.onboard_fare_ids ?? [])
			.map(fareId => fareById.get(fareId))
			.filter((fare): fare is Fare => !!fare);

		return {
			...line,
			onboard_fares_data: onboardFares.map(toFareSimplified),
			prepaid_fare_data: prepaidFare ? toFareSimplified(prepaidFare) : null,
			routes: routesByLineId.get(line._id) ?? [],
			typology_data: typology ? toTypologySimplified(typology) : null,
		};
	});
}

export async function populateLine(lineData: Line): Promise<LineNormalized> {
	const [populatedLine] = await populateLines([lineData]);
	return populatedLine;
}
