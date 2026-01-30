/* * */

import { mergePatternWithEventRules } from '@/utils/rules.js';
import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { patterns, stops } from '@tmlmobilidade/interfaces';
import { CreatePatternDto, type Pattern, PermissionCatalog, type UpdatePatternDto } from '@tmlmobilidade/types';

/* * */

export class PatternsController {
	//

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
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to create patterns');
		}

		//
		// Create the new pattern

		const newPattern = await patterns.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newPattern, error: null, statusCode: HttpStatus.OK });

		//
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
			throw new HttpException(HttpStatus.NOT_FOUND, 'Pattern not found');
		}

		//
		// Get the resource permissions for patterns for the current user.

		const userPatternPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.delete);

		//
		// If no permission found, deny access

		if (!userPatternPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to delete patterns');
		}

		//

		await patterns.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves a single pattern by ID
	 * @param request Fastify request containing pattern ID
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Pattern>) {
		//

		//
		// Get the Pattern from the database

		const patternData = await patterns.findById(request.params.id);

		if (!patternData) throw new HttpException(HttpStatus.NOT_FOUND, 'Pattern not found');

		const merged = await mergePatternWithEventRules(patternData);

		//
		// Get the resource permissions for patterns for the current user.

		const userPatternPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

		//
		// If no permission found, deny access

		if (!userPatternPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read patterns');
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
			const populatedPath = patternData.path.map(pathItem => ({
				...pathItem,
				stop: stopsMap.get(pathItem.stop_id) || null,
			}));

			// Return pattern with populated path
			return reply.send({
				data: { ...merged, path: populatedPath },
				error: null,
				statusCode: HttpStatus.OK,
			});
		}

		//
		// Fetch the pattern data

		return reply.send({
			data: merged,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	/**
	 * Import pattern path and shape from GTFS data
	 * @param request Fastify request containing GTFS import data
	 * @param reply Fastify reply
	 */
	static async importFromGtfs(request: FastifyRequest<{ Body: { path: { shape_dist_traveled: number, stop_id: string, stop_sequence: number }[], shape: { shape_dist_traveled: number, shape_pt_lat: number, shape_pt_lon: number, shape_pt_sequence: number }[] }, Params: { id: string } }>, reply: FastifyReply<Pattern>) {
		//

		//
		// Get pattern data

		const patternData = await patterns.findById(request.params.id);

		//
		// If pattern does not exist, throw error

		if (!patternData) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Pattern not found');
		}

		//
		// Get the resource permissions for the current user.

		const userPatternPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.update);

		//
		// If no permission found, deny access

		if (!userPatternPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to update patterns');
		}

		//
		// Convert GTFS shape points to GeoJSON

		const sortedShapePoints = request.body.shape.sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
		const shapeCoordinates = sortedShapePoints.map(point => [point.shape_pt_lon, point.shape_pt_lat]);
		const shapeExtension = sortedShapePoints[sortedShapePoints.length - 1]?.shape_dist_traveled || 0;

		//
		// Process path with stop population and calculations

		const sortedPath = request.body.path.sort((a, b) => a.stop_sequence - b.stop_sequence);
		const formattedPath = [];
		let prevDistance = 0;

		for (const [pathIndex, pathItem] of sortedPath.entries()) {
			// Find the associated stop by legacy_id
			const associatedStop = await stops.findOne({ legacy_id: pathItem.stop_id.trim() });

			if (!associatedStop) {
				throw new HttpException(HttpStatus.BAD_REQUEST, `The stop "${pathItem.stop_id}" does not exist`);
			}

			// Get original path stop to preserve user settings
			const originalPathStop = patternData.path?.find(item => item.stop_id === associatedStop._id);

			// Calculate distance delta
			const distanceDelta = pathIndex === 0 ? 0 : Math.round(pathItem.shape_dist_traveled) - prevDistance;
			prevDistance = Math.round(pathItem.shape_dist_traveled);

			// Add formatted path item
			formattedPath.push({
				_id: originalPathStop?._id || `temp-${associatedStop._id}-${pathIndex}`,
				allow_drop_off: originalPathStop?.allow_drop_off ?? true,
				allow_pickup: originalPathStop?.allow_pickup ?? true,
				distance_delta: distanceDelta,
				stop_id: associatedStop._id,
				timepoint: originalPathStop?.timepoint ?? true,
				zones: originalPathStop?.zones ?? [], // fix this later
			});
		}

		//
		// Update the pattern with imported data

		const updatedPattern = await patterns.updateById(patternData._id, {
			path: formattedPath,
			shape: {
				extension: Math.round(shapeExtension),
				geojson: {
					geometry: {
						coordinates: shapeCoordinates,
						type: 'LineString',
					},
					properties: {},
					type: 'Feature',
				},
			},
		});

		//
		// Send the updated pattern data as the response

		reply.send({
			data: updatedPattern,
			error: null,
			statusCode: HttpStatus.OK,
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

		if (!patternData) throw new HttpException(HttpStatus.NOT_FOUND, 'Pattern not found');

		//
		// Get the resource permissions for patterns for the current user.

		const userPatternPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.lock);

		//
		// If no permission found, deny access

		if (!userPatternPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to lock/unlock patterns');
		}

		// If authorized, toggle the lock status of the pattern
		await patterns.toggleLockById(request.params.id);
		const foundPattern = await patterns.findById(request.params.id);
		if (!foundPattern) throw new HttpException(HttpStatus.NOT_FOUND, 'Pattern not found');

		return reply.send({ data: foundPattern, error: null, statusCode: HttpStatus.OK });

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

		if (!patternData) throw new HttpException(HttpStatus.NOT_FOUND, 'Pattern not found');

		//
		// Get the resource permissions for patterns for the current user.

		const userPatternPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.update);

		//
		// If no permission found, deny access

		if (!userPatternPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to update patterns');
		}

		//
		// Update the pattern

		const updatedPattern = await patterns.updateById(patternData._id, request.body);

		//
		// Send the updated pattern data as the response

		reply.send({
			data: updatedPattern,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}
	//
}
