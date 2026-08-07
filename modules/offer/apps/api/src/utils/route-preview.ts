/* * */

import { type RoutePreviewDto, type RoutePreviewLeg, type RoutePreviewPoint, type RoutePreviewResponse, type ValhallaLocation, type ValhallaRouteRequest, type ValhallaRouteResponse } from '@/types/shapes.js';
import { decodeValhallaShape } from '@/utils/shapes.js';
import { encodePolylineFromGeoJson } from '@tmlmobilidade/geo';

/* * */

export const DEFAULT_VALHALLA_MAX_LOCATIONS = 50;

interface RoutePreviewChunk {
	from_index: number
	points: RoutePreviewPoint[]
}

interface RouteWithValhallaOptions {
	costing: NonNullable<RoutePreviewDto['costing']>
	costing_options?: RoutePreviewDto['costing_options']
	max_locations?: number
	signal?: AbortSignal
	url: string
}

/* * */

const toMeters = (distanceInKm: number) => Math.round(distanceInKm * 1000);

function getErrorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function getValhallaLocationType(point: RoutePreviewPoint, index: number, length: number): ValhallaLocation['type'] {
	if (index === 0 || index === length - 1) return 'break';
	if (point.type === 'through') return 'break_through';
	return 'break';
}

function createValhallaPayload(
	points: RoutePreviewPoint[],
	costing: NonNullable<RoutePreviewDto['costing']>,
	costingOptions?: RoutePreviewDto['costing_options'],
): ValhallaRouteRequest {
	return {
		costing,
		costing_options: costingOptions,
		directions_options: {
			narrative: false,
			units: 'kilometers',
		},
		locations: points.map((point, index) => ({
			lat: point.lat,
			lon: point.lon,
			type: getValhallaLocationType(point, index, points.length),
		})),
	};
}

export function splitRoutePreviewPoints(
	points: RoutePreviewPoint[],
	maxLocations = DEFAULT_VALHALLA_MAX_LOCATIONS,
): RoutePreviewChunk[] {
	if (maxLocations < 2) throw new Error('Valhalla max locations must be at least 2');

	const chunks: RoutePreviewChunk[] = [];

	for (let fromIndex = 0; fromIndex < points.length - 1; fromIndex += maxLocations - 1) {
		chunks.push({
			from_index: fromIndex,
			points: points.slice(fromIndex, fromIndex + maxLocations),
		});
	}

	return chunks;
}

function createRoutePreviewLeg(
	leg: ValhallaRouteResponse['trip']['legs'][number],
	index: number,
): RoutePreviewLeg {
	const geometry = decodeValhallaShape(leg.shape);
	const distance = toMeters(leg.summary.length);
	const duration = leg.summary.time;
	const geojson = {
		geometry: {
			coordinates: geometry,
			type: 'LineString' as const,
		},
		properties: {
			distance,
			duration,
			from_index: index,
			to_index: index + 1,
		},
		type: 'Feature' as const,
	};

	return {
		distance,
		duration,
		encoded_polyline: encodePolylineFromGeoJson(geojson),
		from_index: index,
		geojson,
		geometry,
		to_index: index + 1,
	};
}

async function requestValhallaChunk(
	chunk: RoutePreviewChunk,
	options: RouteWithValhallaOptions,
): Promise<RoutePreviewLeg[]> {
	const response = await fetch(`${options.url}/route`, {
		body: JSON.stringify(createValhallaPayload(chunk.points, options.costing, options.costing_options)),
		headers: { 'Content-Type': 'application/json' },
		method: 'POST',
		signal: options.signal,
	});

	if (!response.ok) throw new Error(await response.text());

	const data = await response.json() as ValhallaRouteResponse;
	const expectedLegCount = chunk.points.length - 1;

	if (data.trip.legs.length !== expectedLegCount) {
		throw new Error(`Expected ${expectedLegCount} Valhalla legs, received ${data.trip.legs.length}`);
	}

	return data.trip.legs.map((leg, index) => createRoutePreviewLeg(leg, chunk.from_index + index));
}

async function requestValhallaChunkWithFallback(
	chunk: RoutePreviewChunk,
	options: RouteWithValhallaOptions,
): Promise<RoutePreviewLeg[]> {
	try {
		return await requestValhallaChunk(chunk, options);
	} catch (chunkError) {
		if (options.signal?.aborted) throw chunkError;

		if (chunk.points.length === 2) {
			throw new Error(
				`Valhalla route request failed on segment ${chunk.from_index + 1}: ${getErrorMessage(chunkError)}`,
				{ cause: chunkError },
			);
		}

		const legs: RoutePreviewLeg[] = [];

		for (let index = 0; index < chunk.points.length - 1; index++) {
			const pairChunk = {
				from_index: chunk.from_index + index,
				points: chunk.points.slice(index, index + 2),
			};

			try {
				legs.push(...await requestValhallaChunk(pairChunk, options));
			} catch (segmentError) {
				throw new Error(
					`Valhalla route request failed on segment ${pairChunk.from_index + 1}: ${getErrorMessage(segmentError)}`,
					{ cause: segmentError },
				);
			}
		}

		return legs;
	}
}

export function composeRoutePreviewResponse(legs: RoutePreviewLeg[]): RoutePreviewResponse {
	const geometry: [number, number][] = [];
	let distance = 0;
	let duration = 0;

	for (const leg of legs) {
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
		legs,
	};
}

export async function routeWithValhalla(
	points: RoutePreviewPoint[],
	options: RouteWithValhallaOptions,
): Promise<RoutePreviewResponse> {
	const chunks = splitRoutePreviewPoints(points, options.max_locations);
	const chunkLegs = await Promise.all(chunks.map(chunk => requestValhallaChunkWithFallback(chunk, options)));
	return composeRoutePreviewResponse(chunkLegs.flat());
}
