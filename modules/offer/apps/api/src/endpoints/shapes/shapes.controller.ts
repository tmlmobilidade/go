/* * */

import { ValhallaRouteRequest, ValhallaRouteResponse } from '@/types/shapes.js';
import { decodeValhallaShape } from '@/utils/shapes.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';

/* * */

interface RoutePreviewPoint {
	lat: number
	lon: number
	type?: 'break' | 'through' | 'via'
}

interface RoutePreviewDto {
	costing?: 'auto' | 'bicycle' | 'bus' | 'pedestrian'
	points: RoutePreviewPoint[]
}

interface RoutePreviewLeg {
	distance: number
	duration: number
	from_index: number
	geojson: {
		geometry: {
			coordinates: [number, number][]
			type: 'LineString'
		}
		properties: {
			distance: number
			duration: number
			from_index: number
			to_index: number
		}
		type: 'Feature'
	}
	geometry: [number, number][]
	to_index: number
}

interface RoutePreviewResponse {
	distance: number
	duration: number
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

/* * */

const VALHALLA_URL = process.env.VALHALLA_URL ?? 'http://localhost:8002';

const toMeters = (distanceInKm: number) => Math.round(distanceInKm * 1000);

/* * */

export class ShapesController {
	//

	static async routePreview(
		request: FastifyRequest<{ Body: RoutePreviewDto }>,
		reply: FastifyReply<RoutePreviewResponse>,
	) {
		const { costing = 'bus', points } = request.body;

		if (!points || points.length < 2) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'At least 2 points are required');
		}

		for (const point of points) {
			if (typeof point.lat !== 'number' || typeof point.lon !== 'number') {
				throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid point coordinates');
			}
		}

		const fullGeometry: [number, number][] = [];
		const legs: RoutePreviewLeg[] = [];

		let totalDistance = 0;
		let totalDuration = 0;

		for (let index = 0; index < points.length - 1; index++) {
			const from = points[index];
			const to = points[index + 1];

			const valhallaPayload: ValhallaRouteRequest = {
				costing,
				directions_options: {
					units: 'kilometers',
				},
				locations: [
					{
						lat: from.lat,
						lon: from.lon,
						type: 'break',
					},
					{
						lat: to.lat,
						lon: to.lon,
						type: 'break',
					},
				],
			};

			const valhallaResponse = await fetch(`${VALHALLA_URL}/route`, {
				body: JSON.stringify(valhallaPayload),
				headers: { 'Content-Type': 'application/json' },
				method: 'POST',
			});

			if (!valhallaResponse.ok) {
				const errorText = await valhallaResponse.text();

				throw new HttpException(
					HTTP_STATUS.BAD_GATEWAY,
					`Valhalla route request failed on segment ${index + 1}: ${errorText}`,
				);
			}

			const valhallaData = await valhallaResponse.json() as ValhallaRouteResponse;

			const encodedShape = valhallaData?.trip?.legs?.[0]?.shape;

			if (!encodedShape) {
				throw new HttpException(
					HTTP_STATUS.BAD_GATEWAY,
					`Valhalla response did not include a shape for segment ${index + 1}`,
				);
			}

			const segmentGeometry = decodeValhallaShape(encodedShape);

			const segmentDistance = toMeters(valhallaData?.trip?.summary?.length ?? 0);
			const segmentDuration = valhallaData?.trip?.summary?.time ?? 0;

			totalDistance += segmentDistance;
			totalDuration += segmentDuration;

			if (fullGeometry.length > 0) {
				fullGeometry.push(...segmentGeometry.slice(1));
			} else {
				fullGeometry.push(...segmentGeometry);
			}

			legs.push({
				distance: segmentDistance,
				duration: segmentDuration,
				from_index: index,
				geojson: {
					geometry: {
						coordinates: segmentGeometry,
						type: 'LineString',
					},
					properties: {
						distance: segmentDistance,
						duration: segmentDuration,
						from_index: index,
						to_index: index + 1,
					},
					type: 'Feature',
				},
				geometry: segmentGeometry,
				to_index: index + 1,
			});
		}

		return reply.send({
			data: {
				distance: totalDistance,
				duration: totalDuration,
				geojson: {
					geometry: {
						coordinates: fullGeometry,
						type: 'LineString',
					},
					properties: {
						distance: totalDistance,
						duration: totalDuration,
					},
					type: 'Feature',
				},
				geometry: fullGeometry,
				legs,
			},
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	//
}
