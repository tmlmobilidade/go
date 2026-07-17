import { isMotisWalkingLeg, type MotisItinerary } from '@/utils/route-planner-motis';
import { type HubVehiclePosition } from '@tmlmobilidade/go-types-public-info';

/* * */

export function getRoutePlannerItineraryPatternIds(itinerary: MotisItinerary | null) {
	const legs = Array.isArray(itinerary?.legs) ? itinerary.legs : [];
	const transitLegs = legs.filter(leg => !isMotisWalkingLeg(leg));

	if (transitLegs.length === 0) return null;

	return new Set(
		transitLegs
			.map(leg => leg.hubPatternId)
			.filter((patternId): patternId is string => typeof patternId === 'string' && patternId.length > 0),
	);
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
