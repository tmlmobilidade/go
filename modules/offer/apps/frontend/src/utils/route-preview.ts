import { PopulatedPath } from '@tmlmobilidade/go-types-offer';

/* * */

export interface RoutePreviewAnchor {
	_id: string
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
	key: string
	lat: number
	lon: number
	type: 'break' | 'through' | 'via'
}

export interface RoutePreviewLeg {
	distance: number
	duration: number
	encoded_polyline?: string
	from_index: number
	geojson: {
		geometry: {
			coordinates: number[][]
			type: string
		}
		properties: {
			distance: number
			duration: number
			from_index: number
			to_index: number
		}
		type: string
	}
	geometry: [number, number][]
	to_index: number
}

export interface RoutePreviewResponse {
	distance: number
	duration: number
	encoded_polyline: string
	geojson: {
		geometry: {
			coordinates: [number, number][]
			type: 'LineString'
		}
		properties: {
			distance: number
			duration: number
		}
		type: 'Feature'
	}
	geometry: [number, number][]
	legs: RoutePreviewLeg[]
}

export interface RoutePreviewRecalculationRange {
	from_index: number
	to_index: number
}

export interface RoutePreviewRecalculationPlan {
	legs: (RoutePreviewLeg | undefined)[]
	ranges: RoutePreviewRecalculationRange[]
}

interface PathStopEntry {
	pathIndex: number
	pathItem: PopulatedPath
}

/* * */

function createStopPoint(pathItem: PopulatedPath): RoutePreviewPoint {
	return {
		key: `stop:${pathItem._id}`,
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
				key: `anchor:${anchor._id}`,
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

/* * */

function getPointSignature(point: RoutePreviewPoint): string {
	return `${point.key}:${point.lat}:${point.lon}:${point.type}`;
}

function getLegSignature(from: RoutePreviewPoint, to: RoutePreviewPoint): string {
	return `${getPointSignature(from)}>${getPointSignature(to)}`;
}

function reindexRoutePreviewLeg(leg: RoutePreviewLeg, index: number): RoutePreviewLeg {
	return {
		...leg,
		from_index: index,
		geojson: {
			...leg.geojson,
			properties: {
				...leg.geojson.properties,
				from_index: index,
				to_index: index + 1,
			},
		},
		to_index: index + 1,
	};
}

export function buildRoutePreviewRecalculationPlan(
	previousPoints: RoutePreviewPoint[],
	nextPoints: RoutePreviewPoint[],
	previousLegs: RoutePreviewLeg[],
): RoutePreviewRecalculationPlan {
	const nextLegCount = Math.max(0, nextPoints.length - 1);
	const legs: (RoutePreviewLeg | undefined)[] = Array.from({ length: nextLegCount });

	if (previousLegs.length === Math.max(0, previousPoints.length - 1)) {
		const previousLegsBySignature = new Map<string, RoutePreviewLeg>();

		for (let index = 0; index < previousLegs.length; index++) {
			previousLegsBySignature.set(
				getLegSignature(previousPoints[index], previousPoints[index + 1]),
				previousLegs[index],
			);
		}

		for (let index = 0; index < nextLegCount; index++) {
			const previousLeg = previousLegsBySignature.get(
				getLegSignature(nextPoints[index], nextPoints[index + 1]),
			);

			if (previousLeg) legs[index] = reindexRoutePreviewLeg(previousLeg, index);
		}
	}

	const ranges: RoutePreviewRecalculationRange[] = [];
	let rangeStart: number | undefined;

	for (let index = 0; index < legs.length; index++) {
		if (!legs[index] && rangeStart === undefined) rangeStart = index;

		const isRangeEnd = rangeStart !== undefined && (legs[index] || index === legs.length - 1);
		if (!isRangeEnd) continue;

		const lastMissingLegIndex = legs[index] ? index - 1 : index;
		ranges.push({ from_index: rangeStart, to_index: lastMissingLegIndex + 1 });
		rangeStart = undefined;
	}

	return { legs, ranges };
}

export function mergeRoutePreviewRange(
	legs: (RoutePreviewLeg | undefined)[],
	range: RoutePreviewRecalculationRange,
	rangeLegs: RoutePreviewLeg[],
): void {
	const expectedLegCount = range.to_index - range.from_index;
	if (rangeLegs.length !== expectedLegCount) {
		throw new Error(`Expected ${expectedLegCount} route legs, received ${rangeLegs.length}`);
	}

	for (let index = 0; index < rangeLegs.length; index++) {
		const legIndex = range.from_index + index;
		legs[legIndex] = reindexRoutePreviewLeg(rangeLegs[index], legIndex);
	}
}

export function composeRoutePreviewResponse(legs: (RoutePreviewLeg | undefined)[]): RoutePreviewResponse {
	if (legs.some(leg => !leg)) throw new Error('Cannot compose a route preview with missing legs');

	const completeLegs = legs as RoutePreviewLeg[];
	const geometry: [number, number][] = [];
	let distance = 0;
	let duration = 0;

	for (const leg of completeLegs) {
		distance += leg.distance;
		duration += leg.duration;

		if (geometry.length) geometry.push(...leg.geometry.slice(1));
		else geometry.push(...leg.geometry);
	}

	const geojson = {
		geometry: {
			coordinates: geometry,
			type: 'LineString' as const,
		},
		properties: { distance, duration },
		type: 'Feature' as const,
	};

	return {
		distance,
		duration,
		encoded_polyline: encodePolylineFromGeoJson(geojson),
		geojson,
		geometry,
		legs: completeLegs,
	};
}
