import { isMotisWalkingLeg, type MotisItinerary } from '@/utils/route-planner-motis';
import { type HubVehiclePosition } from '@tmlmobilidade/go-types-public-info';

/* * */

export function getRoutePlannerItineraryRouteDirections(itinerary: MotisItinerary | null) {
	const legs = Array.isArray(itinerary?.legs) ? itinerary.legs : [];
	const transitLegs = legs.filter(leg => !isMotisWalkingLeg(leg));

	if (transitLegs.length === 0) return null;

	return new Set(
		transitLegs
			.map(leg => getRouteDirectionKey(leg.routeId, leg.directionId, leg.agencyId))
			.filter((routeDirection): routeDirection is string => routeDirection !== null),
	);
}

export function filterVehicleFeatureCollectionByRouteDirections(
	vehiclesData: GeoJSON.FeatureCollection<GeoJSON.Point, HubVehiclePosition>,
	routeDirections: null | Set<string>,
) {
	if (!routeDirections) return vehiclesData;

	return {
		...vehiclesData,
		features: vehiclesData.features.filter((feature) => {
			const vehicle = feature.properties;
			const routeDirection = getRouteDirectionKey(vehicle?.route_id, vehicle?.direction_id, vehicle?.agency_id);
			return routeDirection !== null && routeDirections.has(routeDirection);
		}),
	};
}

export function filterVehicleFeatureCollectionByPatternIds(
	vehiclesData: GeoJSON.FeatureCollection<GeoJSON.Point, HubVehiclePosition>,
	patternIds: null | Set<string>,
) {
	if (!patternIds) return vehiclesData;

	return {
		...vehiclesData,
		features: vehiclesData.features.filter((feature) => {
			const patternId = feature.properties?.pattern_id;
			return typeof patternId === 'string' && patternIds.has(patternId);
		}),
	};
}

/* * */

function getRouteDirectionKey(routeId: null | string | undefined, directionId: null | number | string | undefined, agencyId: null | string | undefined) {
	if (!routeId || directionId === null || directionId === undefined || directionId === '') return null;

	const parsedDirectionId = Number(directionId);
	if (!Number.isInteger(parsedDirectionId)) return null;

	const publicRouteIdStart = routeId.indexOf('[');
	const routeIdWithoutDataset = publicRouteIdStart >= 0 ? routeId.slice(publicRouteIdStart) : routeId;
	const normalizedRouteId = routeIdWithoutDataset.startsWith('[') || !agencyId
		? routeIdWithoutDataset
		: `[${agencyId}]${routeIdWithoutDataset}`;

	return `${normalizedRouteId}:${parsedDirectionId}`;
}
