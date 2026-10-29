/* * */

import { authorizePatternAccess } from '@/utils/pattern-access.js';
import { createImportedStopResolver } from '@/utils/stops.js';
import { encodePolylineFromGeoJson } from '@tmlmobilidade/geo';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type PatternsDetail, type PatternsDetailPathItem, type PatternsImportGtfsRequest, PatternsImportGtfsRequestSchema } from '@tmlmobilidade/go-offer-pckg-types';
import { type StopsParameter } from '@tmlmobilidade/go-types-offer';
import { generateRandomString } from '@tmlmobilidade/strings';

/**
 * Import pattern path and shape from GTFS data
 * @param request Fastify request containing GTFS import data
 * @param reply Fastify reply
 */
export async function importPatternGtfsHandler(request: FastifyRequest<{ Body: PatternsImportGtfsRequest, Params: { id: string } }>, reply: FastifyReply<PatternsDetail>) {
	//
	// Validate the computed GTFS preview request before processing it.

	const validatedImport = PatternsImportGtfsRequestSchema.safeParse(request.body);
	if (!validatedImport.success) {
		return sendErrorApiResponse(reply, { error: validatedImport.error.message, status_code: '400' });
	}

	//

	//
	// Get pattern data

	const patternData = await goDb.offer.patterns.findById(request.params.id);

	//
	// If pattern does not exist, throw error

	if (!patternData) {
		return sendErrorApiResponse(reply, { error: 'Pattern not found', status_code: '404' });
	}

	//
	// Get the resource permissions for the current user.

	const access = await authorizePatternAccess({ action: 'update', pattern: patternData, permissions: request.permissions });
	if (access.success === false) {
		return sendErrorApiResponse(reply, { error: access.error, status_code: access.status_code });
	}

	//
	// Get agencyId and Create stops cache

	const lineData = access.line;

	const agencyId = lineData.agency_id;

	const resolveImportedStop = createImportedStopResolver(agencyId);

	//
	// Convert GTFS shape points to GeoJSON

	const sortedShapePoints = validatedImport.data.shape.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
	const shapeCoordinates = sortedShapePoints.map(point => [point.shape_pt_lon, point.shape_pt_lat] as [number, number]);
	const shapeExtension = sortedShapePoints[sortedShapePoints.length - 1]?.shape_dist_traveled || 0;
	const shapeGeoJson = {
		geometry: {
			coordinates: shapeCoordinates,
			type: 'LineString' as const,
		},
		properties: {},
		type: 'Feature' as const,
	};

	//
	// Process path with stop population and calculations

	const sortedPath = validatedImport.data.path.sort((a, b) => a.stop_sequence - b.stop_sequence);
	const formattedPath = [];
	const populatedPath: PatternsDetailPathItem[] = [];
	let prevDistance = 0;

	for (const [pathIndex, pathItem] of sortedPath.entries()) {
		// Find the associated stop
		const associatedStop = await resolveImportedStop(pathItem.stop_id);

		if (!associatedStop) {
			return sendErrorApiResponse(reply, { error: `The stop "${pathItem.stop_id}" does not exist`, status_code: '400' });
		}

		// Get original path stop to preserve user settings
		const originalPathStop = patternData.path?.find(item => item.stop_id === associatedStop._id);

		// Calculate distance delta
		const distanceDelta = pathIndex === 0 ? 0 : Math.round(pathItem.shape_dist_traveled) - prevDistance;
		prevDistance = Math.round(pathItem.shape_dist_traveled);

		// Add formatted path item
		const pathEntry = {
			_id: originalPathStop?._id || `temp-${associatedStop._id}-${pathIndex}`,
			allow_drop_off: originalPathStop?.allow_drop_off ?? true,
			allow_pickup: originalPathStop?.allow_pickup ?? true,
			distance_delta: distanceDelta,
			stop_id: associatedStop._id,
			timepoint: originalPathStop?.timepoint ?? true,
			zones: originalPathStop?.zones ?? [], // fix this later
		};
		formattedPath.push(pathEntry);
		populatedPath.push({ ...pathEntry, stop: associatedStop });
	}

	// Build parameter path using avg_speed and dwell_time computed by the GTFS parser,
	// falling back to existing parameter values for matching stops
	const existingDefaultParam = patternData.parameters?.find(p => p.kind === 'default');
	const existingSpeedMap = new Map(existingDefaultParam?.path.map(p => [p.stop_id, p]) ?? []);

	const defaultParameter: StopsParameter = {
		_id: generateRandomString({ length: 5 }),
		kind: 'default',
		path: formattedPath.map((p, i) => ({
			avg_speed: sortedPath[i].avg_speed || existingSpeedMap.get(p.stop_id)?.avg_speed || 0,
			dwell_time: sortedPath[i].dwell_time ?? existingSpeedMap.get(p.stop_id)?.dwell_time ?? 30,
			stop_id: p.stop_id,
		})),
	};

	//
	// Build the computed import result (without saving — the frontend loads it into the form and the user confirms via the save button)

	const importResult: PatternsDetail = {
		...patternData,
		parameters: [defaultParameter],
		path: populatedPath,
		shape: {
			encoded_polyline: encodePolylineFromGeoJson(shapeGeoJson),
			extension: Math.round(shapeExtension),
			geojson: shapeGeoJson,
		},
	};

	//
	// Send the computed data as the response

	return sendSuccessApiResponse(reply, importResult);

	//
}
