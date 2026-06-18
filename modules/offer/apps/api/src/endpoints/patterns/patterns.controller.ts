/* * */

import { generateComments } from '@/utils/comments.js';
import { mergePatternWithEventRules } from '@/utils/rules.js';
import { createImportedStopResolver } from '@/utils/stops.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { encodePolylineFromGeoJson } from '@tmlmobilidade/geo';
import { lines, patterns, stops, typologies } from '@tmlmobilidade/interfaces';
import { generateRandomString } from '@tmlmobilidade/strings';
import { CreatePatternDto, NoteComment, type Pattern, type PatternShapeMapItem, PermissionCatalog, PopulatedPath, PopulatedPattern, StopsParameter, type UpdatePatternDto, UpdatePatternSchema } from '@tmlmobilidade/types';

/* * */

export class PatternsController {
	//

	/**
	 * Adds a comment to a pattern by pattern ID
	 */
	static async comment(request: FastifyRequest<{ Body: NoteComment, Params: { id: string } }>, reply: FastifyReply<Pattern>) {
		//

		const patternData = await patterns.findById(request.params.id);

		if (!patternData) {
			return reply.status(HTTP_STATUS.NOT_FOUND).send({
				data: null,
				error: 'Pattern not found.',
				statusCode: HTTP_STATUS.NOT_FOUND,
			});
		}

		const createdBy = request.me.first_name + ' ' + request.me.last_name;

		const updateResult = await patterns.updateById(
			request.params.id,
			{ comments: [...patternData.comments, { ...request.body, created_by: createdBy, updated_by: createdBy }], updated_by: createdBy },
		);

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	/**
	 * Creates a new pattern.
	 * @param request Fastify request containing pattern data in body
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreatePatternDto }>, reply: FastifyReply<Pattern>) {
		//

		//
		// Get the resource permissions for patterns for the current user.

		const userPatternPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.create);

		//
		// If no permission found, deny access

		if (!userPatternPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create patterns');
		}

		//
		// Create the new pattern, always seeding an empty default parameters entry

		const defaultParameter: StopsParameter = {
			_id: generateRandomString({ length: 5 }),
			kind: 'default',
			path: [],
		};

		const newPattern = await patterns.insertOne({
			...request.body,
			parameters: [defaultParameter],
		});

		//
		// Send the response

		reply.send({ data: newPattern, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Retrieves compact pattern shape data for one agency.
	 */
	static async getShapesByAgencies(request: FastifyRequest<{ Querystring: { agency_ids?: string } }>, reply: FastifyReply<PatternShapeMapItem[]>) {
		const agencyIds = request.query.agency_ids?.split(',').filter(Boolean) ?? [];

		if (!agencyIds.length) {
			throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'agency_ids is required');
		}

		const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

		if (!userLinePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read patterns');
		}

		const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.lines.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.lines.scope,
			value: agencyIds,
		});

		if (!hasPermissionForAgency) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read patterns for this agency');
		}

		const agencyLines = await lines.findMany(
			{ agency_id: { $in: agencyIds } },
			{ projection: { _id: 1, agency_id: 1, code: 1, name: 1, typology: 1 }, sort: { code: 1 } },
		);

		const lineIds = agencyLines.map(line => line._id);
		if (!lineIds.length) return reply.send({ data: [], error: null, statusCode: HTTP_STATUS.OK });

		const agencyTypologies = await typologies.findByAgencyIds(agencyIds);
		const typologyColorById = new Map(agencyTypologies.map(typology => [typology._id, typology.color]));
		const typologyTextColorById = new Map(agencyTypologies.map(typology => [typology._id, typology.text_color]));
		const lineById = new Map(agencyLines.map(line => [line._id, line]));

		const agencyPatterns = await patterns.findMany(
			{
				'line_id': { $in: lineIds },
				'shape.encoded_polyline': { $exists: true },
			},
			{
				projection: {
					'_id': 1,
					'code': 1,
					'destination': 1,
					'headsign': 1,
					'line_id': 1,
					'origin': 1,
					'route_id': 1,
					'shape.encoded_polyline': 1,
				},
				sort: { code: 1 },
			},
		);

		const result = agencyPatterns.flatMap((pattern): PatternShapeMapItem[] => {
			const line = lineById.get(pattern.line_id);
			const encodedPolyline = pattern.shape?.encoded_polyline;
			if (!line || !encodedPolyline) return [];

			return [{
				agency_id: line.agency_id,
				color: line.typology ? typologyColorById.get(line.typology) ?? '#1c7ed6' : '#1c7ed6',
				destination: pattern.destination,
				encoded_polyline: encodedPolyline,
				headsign: pattern.headsign,
				line_code: line.code,
				line_id: line._id,
				line_name: line.name,
				line_text_color: line.typology ? typologyTextColorById.get(line.typology) ?? '#ffffff' : '#ffffff',
				origin: pattern.origin,
				pattern_code: pattern.code,
				pattern_id: pattern._id,
				route_id: pattern.route_id,
			}];
		});

		return reply.send({ data: result, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Deletes a pattern by ID
	 * @param request Fastify request containing pattern ID
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const pattern = await patterns.findById(id);

		if (!pattern) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Pattern not found');
		}

		//
		// Get the resource permissions for patterns for the current user.

		const userPatternPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.delete);

		//
		// If no permission found, deny access

		if (!userPatternPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete patterns');
		}

		//

		await patterns.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves a single pattern by ID
	 * @param request Fastify request containing pattern ID
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<PopulatedPattern>) {
		//

		//
		// Get the Pattern from the database

		const patternData: null | Pattern = await patterns.findById(request.params.id);

		if (!patternData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Pattern not found');
		}

		const merged = await mergePatternWithEventRules(patternData);

		//
		// Get the resource permissions for patterns for the current user.

		const userPatternPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

		//
		// If no permission found, deny access

		if (!userPatternPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read patterns');
		}

		//
		// Populate stop data for each path item

		if (patternData.path && patternData.path.length > 0) {
			const stopIds = patternData.path.map(pathItem => pathItem.stop_id);
			const stopsData = await stops.findMany(
				{ _id: { $in: stopIds } },
			);

			// Create a map for quick lookup
			const stopsMap = new Map(stopsData.map(stop => [stop._id, stop]));

			// Populate the path with stop data
			const populatedPath: PopulatedPath[] = patternData.path.map(pathItem => ({
				...pathItem,
				stop: stopsMap.get(pathItem.stop_id) || null,
			}));

			// Return pattern with populated path
			return reply.send({
				data: { ...merged, path: populatedPath },
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		}

		//
		// Fetch the pattern data

		return reply.send({
			data: merged as PopulatedPattern,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Import pattern path and shape from GTFS data
	 * @param request Fastify request containing GTFS import data
	 * @param reply Fastify reply
	 */
	static async importFromGtfs(request: FastifyRequest<{ Body: { path: { avg_speed: number, dwell_time: number, shape_dist_traveled: number, stop_id: string, stop_sequence: number }[], shape: { shape_dist_traveled: number, shape_pt_lat: number, shape_pt_lon: number, shape_pt_sequence: number }[] }, Params: { id: string } }>, reply: FastifyReply<PopulatedPattern>) {
		//

		//
		// Get pattern data

		const patternData = await patterns.findById(request.params.id);

		//
		// If pattern does not exist, throw error

		if (!patternData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Pattern not found');
		}

		//
		// Get the resource permissions for the current user.

		const userPatternPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.update);

		//
		// If no permission found, deny access

		if (!userPatternPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update patterns');
		}

		//
		// Get agencyId and Create stops cache

		const lineData = await lines.findById(patternData.line_id);

		if (!lineData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Line not found for pattern');
		}

		const agencyId = lineData.agency_id;

		const resolveImportedStop = createImportedStopResolver(agencyId);

		//
		// Convert GTFS shape points to GeoJSON

		const sortedShapePoints = request.body.shape.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
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

		const sortedPath = request.body.path.sort((a, b) => a.stop_sequence - b.stop_sequence);
		const formattedPath = [];
		const populatedPath: PopulatedPath[] = [];
		let prevDistance = 0;

		for (const [pathIndex, pathItem] of sortedPath.entries()) {
			// Find the associated stop
			const associatedStop = await resolveImportedStop(pathItem.stop_id);

			if (!associatedStop) {
				const error = new HttpException(HTTP_STATUS.BAD_REQUEST, `The stop "${pathItem.stop_id}" does not exist`);
				throw error;
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

		const importResult: PopulatedPattern = {
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

		reply.send({
			data: importResult,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of a pattern by ID
	 * @param request Fastify request containing pattern ID
	 * @param reply Fastify reply
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Pattern>) {
		//

		//
		// Get the Pattern from the database

		const patternData = await patterns.findById(request.params.id);

		if (!patternData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Pattern not found');
		}

		//
		// Get the resource permissions for patterns for the current user.

		const userPatternPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.lock);

		//
		// If no permission found, deny access

		if (!userPatternPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock patterns');
		}

		// If authorized, toggle the lock status of the pattern
		await patterns.toggleLockById(request.params.id);
		const foundPattern = await patterns.findById(request.params.id);
		if (!foundPattern) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Pattern not found');
		}

		return reply.send({ data: foundPattern, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Updates an existing pattern by ID
	 * @param request Fastify request containing pattern ID and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdatePatternDto, Params: { id: string } }>, reply: FastifyReply<Pattern>) {
		//

		//
		// Get the Pattern from the database

		const patternData = await patterns.findById(request.params.id);

		if (!patternData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Pattern not found');
		}

		//
		// Get the resource permissions for patterns for the current user.

		const userPatternPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.update);

		//
		// If no permission found, deny access

		if (!userPatternPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update patterns');
		}

		const sanitizedBody = UpdatePatternSchema.parse(request.body);

		//
		// Generate activity comments
		const patternComments = generateComments(
			patternData,
			sanitizedBody,
			{
				excludeFields: ['comments', 'updated_at', 'updated_by'],
				updatedBy: request.me.first_name + ' ' + request.me.last_name,
			},
		);

		// Merge with existing comments
		const updateData = {
			...sanitizedBody,
			comments: [
				...(patternData.comments || []),
				...patternComments,
			],
		};

		//
		// Update the pattern

		const updatedPattern = await patterns.updateById(patternData._id, updateData);

		//
		// Send the updated pattern data as the response

		reply.send({
			data: updatedPattern,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}
	//
}
