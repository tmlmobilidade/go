import { PopulatedPath } from '@tmlmobilidade/types';

/* * */

export interface RoutePreviewAnchor {
	after_stop_id: number
	before_stop_id: number
	lat: number
	lon: number
	sequence: number
	type: 'through' | 'via'
}

export interface RoutePreviewLegSegment {
	after_stop_id: number
	before_stop_id: number
	leg_from_index: number
	leg_to_index: number
	stop_from_index: number
	stop_to_index: number
}

export interface RoutePreviewPoint {
	lat: number
	lon: number
	type: 'break' | 'through' | 'via'
}

interface PathStopEntry {
	pathIndex: number
	pathItem: PopulatedPath
}

/* * */

function createStopPoint(pathItem: PopulatedPath): RoutePreviewPoint {
	return {
		lat: pathItem.stop?.latitude ?? 0,
		lon: pathItem.stop?.longitude ?? 0,
		type: 'break',
	};
}

function getPathStops(path: PopulatedPath[]): PathStopEntry[] {
	return path.flatMap((pathItem, pathIndex) => (
		pathItem.stop ? [{ pathIndex, pathItem }] : []
	));
}

/* * */

export function buildRoutePreviewModel(path: PopulatedPath[], anchors: RoutePreviewAnchor[]) {
	const pathStops = getPathStops(path);

	if (!pathStops.length) {
		return {
			legSegments: [] as RoutePreviewLegSegment[],
			points: [] as RoutePreviewPoint[],
		};
	}

	const points: RoutePreviewPoint[] = [createStopPoint(pathStops[0].pathItem)];
	const legSegments: RoutePreviewLegSegment[] = [];

	for (let index = 0; index < pathStops.length - 1; index++) {
		const currentStop = pathStops[index];
		const nextStop = pathStops[index + 1];

		const segmentAnchors = anchors
			.filter(anchor => (
				anchor.after_stop_id === currentStop.pathItem.stop_id &&
				anchor.before_stop_id === nextStop.pathItem.stop_id
			))
			.sort((a, b) => a.sequence - b.sequence);

		const segmentPoints: RoutePreviewPoint[] = [
			...segmentAnchors.map(anchor => ({
				lat: anchor.lat,
				lon: anchor.lon,
				type: anchor.type,
			})),
			createStopPoint(nextStop.pathItem),
		];

		for (const segmentPoint of segmentPoints) {
			const legFromIndex = points.length - 1;

			points.push(segmentPoint);

			legSegments.push({
				after_stop_id: currentStop.pathItem.stop_id,
				before_stop_id: nextStop.pathItem.stop_id,
				leg_from_index: legFromIndex,
				leg_to_index: points.length - 1,
				stop_from_index: currentStop.pathIndex,
				stop_to_index: nextStop.pathIndex,
			});
		}
	}

	return {
		legSegments,
		points,
	};
}
