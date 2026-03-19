/* * */

import { getStopByLegacyId } from '@/utils/stops.js';
import { patterns } from '@tmlmobilidade/interfaces';
import { type CreatePatternDto, GtfsTMLStopTimes, GtfsTMLTrip, PatternDirection, patternDirectionMapper, type Shape } from '@tmlmobilidade/types';

import {
	normalizeGtfsDistance,
	normalizeGtfsTimeToSeconds,
	resolvePatternCode,
	resolvePatternKey,
} from '../helpers/index.js';

/* * */

export interface BuiltPattern {
	input: CreatePatternDto
	patternKey: string
}

/**
 * Build pattern DTOs for a set of route trips without writing to the database.
 * Returns the list of pattern inputs and a key→code mapping for schedule resolution.
 */
export async function buildPatternsForRoute(params: {
	lineCode: string
	lineId: string
	missingZoneCodes: Set<string>
	routeDocsByCode: Map<string, { _id: string }>
	routeTrips: GtfsTMLTrip[]
	shapesById: Map<string, Shape>
	stopCache: Map<string, { _id: string, name: string }>
	stopTimesByTrip: Map<string, GtfsTMLStopTimes[]>
	zoneIdByCode: Map<string, string>
	zonesByPatternStop: Map<string, string[]>
	zonesByStop: Map<string, string[]>
}): Promise<{ builtPatterns: BuiltPattern[], patternsInGtfs: number }> {
	const {
		lineCode,
		lineId,
		missingZoneCodes,
		routeDocsByCode,
		routeTrips,
		shapesById,
		stopCache,
		stopTimesByTrip,
		zoneIdByCode,
		zonesByPatternStop,
		zonesByStop,
	} = params;

	let patternsInGtfs = 0;
	const builtPatterns: BuiltPattern[] = [];

	//
	// A. Build patterns per direction

	const patternsByDirection = new Map<string, Map<string, { patternKey: string, stopTimes: GtfsTMLStopTimes[], trip: GtfsTMLTrip }>>();
	for (const trip of routeTrips) {
		const directionId = patternDirectionMapper.fromGtfs(trip.direction_id ?? '0') as PatternDirection;
		const stopTimes = stopTimesByTrip.get(trip.trip_id) ?? [];
		if (!stopTimes.length) continue;
		const fingerprint = stopTimes.map(stopTime => stopTime.stop_id).join('|');
		const patternKey = resolvePatternKey(directionId, trip.pattern_id ?? null, fingerprint);
		if (!patternsByDirection.has(directionId)) patternsByDirection.set(directionId, new Map());
		if (!patternsByDirection.get(directionId)?.has(patternKey)) {
			patternsByDirection.get(directionId)?.set(patternKey, { patternKey, stopTimes, trip });
		}
	}

	//
	// B. Build pattern DTOs

	for (const [directionId, patternGroup] of patternsByDirection.entries()) {
		patternsInGtfs += patternGroup.size;

		let patternIndex = 0;
		for (const [, { patternKey, stopTimes, trip }] of patternGroup.entries()) {
			const routeKey = routeDocsByCode.has(trip.route_id)
				? trip.route_id
				: `${lineCode}_${directionId}`.slice(0, 10);
			const routeDoc = routeDocsByCode.get(routeKey);
			if (!routeDoc) {
				console.log('[gtfs-importer] Missing route for patterns', {
					line_id: lineId,
					routeCode: routeKey,
					trip_route_id: trip.route_id,
				});
				patternIndex += 1;
				continue;
			}
			const formattedPath: CreatePatternDto['path'] = [];
			const parametersPath: { avg_speed: number, dwell_time: number, stop_id: string }[] = [];
			const pathMetrics: Array<{ arrivalSec: null | number, departureSec: null | number, distanceDelta: number, stopRefId: string }> = [];
			let prevDistance: null | number = null;

			for (const [stopIndex, stopTime] of stopTimes.entries()) {
				const stopId = stopTime.stop_id.trim();
				const stopRef = await getStopByLegacyId(stopId, stopCache);
				if (!stopRef) {
					console.log('[gtfs-importer] Missing stop for pattern', {
						stop_id: stopId,
						trip_id: trip.trip_id,
					});
					continue;
				}

				const currentDistance = normalizeGtfsDistance(stopTime.shape_dist_traveled);
				let distanceDelta = 0;
				if (stopIndex === 0) {
					if (currentDistance !== null) prevDistance = currentDistance;
				} else if (currentDistance !== null && prevDistance !== null) {
					distanceDelta = Math.round(Math.max(0, (currentDistance - prevDistance) * 1000));
					prevDistance = currentDistance;
				} else if (currentDistance !== null) {
					prevDistance = currentDistance;
				}

				const patternZoneKey = trip.pattern_id ? `${trip.pattern_id}:${stopId}` : null;
				const zoneCodes = (patternZoneKey ? zonesByPatternStop.get(patternZoneKey) : undefined) ?? zonesByStop.get(stopId) ?? [];
				const zoneIds = zoneCodes.flatMap((code) => {
					const zoneId = zoneIdByCode.get(code);
					if (!zoneId) missingZoneCodes.add(code);
					return zoneId ? [zoneId] : [];
				});
				const zones = [...new Set(zoneIds)];
				const arrivalSec = normalizeGtfsTimeToSeconds(stopTime.arrival_time);
				const departureSec = normalizeGtfsTimeToSeconds(stopTime.departure_time);

				formattedPath.push({
					_id: `${stopRef._id}-${stopIndex}`,
					allow_drop_off: parseInt(stopTime.drop_off_type) === 0,
					allow_pickup: parseInt(stopTime.pickup_type) === 0,
					distance_delta: distanceDelta,
					stop_id: stopRef._id,
					timepoint: parseInt(stopTime.timepoint) === 1,
					zones,
				});

				pathMetrics.push({
					arrivalSec,
					departureSec,
					distanceDelta,
					stopRefId: stopRef._id,
				});
			}

			for (let i = 0; i < pathMetrics.length; i += 1) {
				const current = pathMetrics[i];
				const previous = pathMetrics[i - 1];
				const dwellTime = current.arrivalSec !== null && current.departureSec !== null
					? Math.max(0, current.departureSec - current.arrivalSec)
					: 0;
				let avgSpeed = 0;
				if (i > 0 && previous?.departureSec !== null && current.arrivalSec !== null) {
					const travelTime = current.arrivalSec - previous.departureSec;
					const segmentDistance = current.distanceDelta;
					if (travelTime > 0 && segmentDistance > 0) {
						avgSpeed = Math.round((segmentDistance * 3.6) / travelTime);
					}
				}

				parametersPath.push({
					avg_speed: avgSpeed,
					dwell_time: dwellTime,
					stop_id: current.stopRefId,
				});
			}

			const originStop = stopTimes[0];
			const destinationStop = stopTimes[stopTimes.length - 1];
			const origin = originStop ? (stopCache.get(originStop.stop_id)?.name ?? originStop.stop_id) : (trip.trip_headsign ?? 'Origem');
			const destination = destinationStop ? (stopCache.get(destinationStop.stop_id)?.name ?? destinationStop.stop_id) : (trip.trip_headsign ?? 'Destino');

			const patternCode = resolvePatternCode(lineCode, directionId, trip.pattern_id ?? null, patternIndex);
			const patternInput: CreatePatternDto = {
				code: patternCode,
				comments: [],
				created_by: 'system',
				destination,
				direction: directionId as PatternDirection,
				headsign: trip.trip_headsign ?? destination,
				is_locked: false,
				line_id: lineId,
				origin,
				parameters: [{
					kind: 'default',
					path: parametersPath,
				}],
				path: formattedPath,
				route_id: routeDoc._id,
				rules: [],
			};
			const shape = trip.shape_id ? shapesById.get(trip.shape_id) : null;
			if (shape) patternInput.shape = shape;

			builtPatterns.push({ input: patternInput, patternKey });
			patternIndex += 1;
		}
	}

	return { builtPatterns, patternsInGtfs };
}

/**
 * Insert built patterns into the database.
 */
export async function insertPatterns(builtPatterns: BuiltPattern[]): Promise<{ patternsCreated: number }> {
	let patternsCreated = 0;

	for (const { input } of builtPatterns) {
		const patternDoc = await patterns.insertOne(input);
		patternsCreated += 1;
		console.log('[gtfs-importer] Pattern created', {
			code: input.code,
			pattern_id: patternDoc._id,
			rules: input.rules?.length ?? 0,
		});
	}

	return { patternsCreated };
}
