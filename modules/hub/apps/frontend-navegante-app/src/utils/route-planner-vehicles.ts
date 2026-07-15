import { getMotisLegRouteLabel, isMotisWalkingLeg, type MotisItinerary } from '@/utils/route-planner-motis';
import { type HubLine, type HubVehiclePosition } from '@tmlmobilidade/go-types-public-info';

/* * */

export function getRoutePlannerItineraryLineIds(itinerary: MotisItinerary | null, lines: HubLine[]) {
	const legs = Array.isArray(itinerary?.legs) ? itinerary.legs : [];
	const routeLabels = new Set(
		legs
			.filter(leg => !isMotisWalkingLeg(leg))
			.map(leg => getMotisLegRouteLabel(leg))
			.filter(Boolean),
	);

	if (routeLabels.size === 0 || lines.length === 0) return null;

	return new Set(
		lines
			.filter(line => routeLabels.has(line.short_name))
			.map(line => line._id),
	);
}

export function filterVehicleFeatureCollectionByLineIds(
	vehiclesData: GeoJSON.FeatureCollection<GeoJSON.Point, HubVehiclePosition>,
	lineIds: null | Set<string>,
) {
	if (!lineIds) return vehiclesData;

	return {
		...vehiclesData,
		features: vehiclesData.features.filter((feature) => {
			const lineId = feature.properties?.line_id;
			return typeof lineId === 'string' && lineIds.has(lineId);
		}),
	};
}
