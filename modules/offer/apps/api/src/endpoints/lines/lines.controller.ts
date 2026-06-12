/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type Filter, lines, routes } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { CreateLineDto, type Line, PermissionCatalog, RouteSimplified, type UpdateLineDto } from '@tmlmobilidade/types';

/* * */

export class LinesController {
	//

	/**
	 * Creates a new line.
	 * @param request Fastify request containing line data
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateLineDto }>, reply: FastifyReply<Line>) {
		//

		//
		// Get the resource permissions for lines for the current user.

		const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.create);

		//
		// If no permission found, deny access

		if (!userLinePermissions) {
			const error = new Error('You are not authorized to create lines');
			Logger.issue('error', error, {
				action: 'create',
				feature: 'lines',
				request,
			});
			throw error;
		}

		//
		// Validate that user has permission for the specified agency

		const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.lines.actions.create,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.lines.scope,
			value: [request.body.agency_id],
		});

		if (!hasPermissionForAgency) {
			const error = new Error('You are not authorized to create lines for this agency');
			Logger.issue('error', error, {
				action: 'create',
				feature: 'lines',
				request,
			});
			throw error;
		}

		//
		// Create the new line

		const newLine = await lines.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newLine, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Deletes a line by ID
	 * @param request Fastify request containing line ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const line = await lines.findById(id);

		if (!line) {
			const error = new Error('Line not found');
			Logger.issue('error', error, {
				action: 'delete',
				feature: 'lines',
				request,
			});
			throw error;
		}

		//
		// Get the resource permissions for lines for the current user.

		const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.delete);

		//
		// If no permission found, deny access

		if (!userLinePermissions) {
			const error = new Error('You are not authorized to delete lines');
			Logger.issue('error', error, {
				action: 'delete',
				feature: 'lines',
				request,
			});
			throw error;
		}

		//
		// Validate that user has permission for this line's agency

		const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.lines.actions.delete,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.lines.scope,
			value: [line.agency_id],
		});

		if (!hasPermissionForAgency) {
			const error = new Error('You are not authorized to delete this line');
			Logger.issue('error', error, {
				action: 'delete',
				feature: 'lines',
				request,
			});
			throw error;
		}

		//

		await lines.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all lines.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Line[]>) {
		//

		//
		// Get the resource permissions for lines for the current user.

		const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

		//
		// If no permission found, deny access

		if (!userLinePermissions) {
			const error = new Error('You are not authorized to read lines');
			Logger.issue('error', error, {
				action: 'getAll',
				feature: 'lines',
				request,
			});
			throw error;
		}

		//
		// Build database query filters based on user permissions

		const queryFilters: Filter<Line> = {};

		//
		// If agency_id is specified in resources and does not include the ALLOW_ALL_FLAG,
		// filter lines by those agency IDs.

		if ('resources' in userLinePermissions && 'agency_ids' in userLinePermissions.resources) {
			if (!userLinePermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
				queryFilters.agency_id = { $in: userLinePermissions.resources['agency_ids'] };
			}
		}

		//
		// Fetch lines based on query filters

		const allLines = await lines.findMany(queryFilters, { sort: { created_at: -1 } });

		return reply.send({ data: allLines, error: null, statusCode: HTTP_STATUS.OK });
		//
	}

	/**
	 * Retrieves a single line by ID with its routes
	 * @param request Fastify request containing line ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Line>) {
		//

		//
		// Get the Line from the database

		const lineData = await lines.findById(request.params.id);

		if (!lineData) {
			const error = new Error('Line not found');
			Logger.issue('error', error, {
				action: 'getById',
				feature: 'lines',
				request,
			});
			throw error;
		}

		//
		// Get the resource permissions for lines for the current user.

		const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

		//
		// If no permission found, deny access

		if (!userLinePermissions) {
			const error = new Error('You are not authorized to read lines');
			Logger.issue('error', error, {
				action: 'getById',
				feature: 'lines',
				request,
			});
			throw error;
		}

		//
		// Validate that user has permission for this line's agency

		const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.lines.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.lines.scope,
			value: [lineData.agency_id],
		});

		if (!hasPermissionForAgency) {
			const error = new Error('You are not authorized to read this line');
			Logger.issue('error', error, {
				action: 'getById',
				feature: 'lines',
				request,
			});
			throw error;
		}

		//
		// Fetch routes for this line

		const lineRoutes = await routes.findMany(
			{ line_id: request.params.id },
			{ projection: { _id: 1, code: 1, name: 1 }, sort: { created_at: -1 } },
		) as RouteSimplified[];

		//
		// Return the line data with routes

		return reply.send({
			data: { ...lineData, routes: lineRoutes },
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of a line by ID
	 * @param request Fastify request containing line ID in params
	 * @param reply Fastify reply
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Line>) {
		//

		//
		// Get the Line from the database

		const lineData = await lines.findById(request.params.id);

		if (!lineData) {
			const error = new Error('Line not found');
			Logger.issue('error', error, {
				action: 'lock',
				feature: 'lines',
				request,
			});
			throw error;
		}

		//
		// Get the resource permissions for lines for the current user.

		const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.lock);

		//
		// If no permission found, deny access

		if (!userLinePermissions) {
			const error = new Error('You are not authorized to lock/unlock lines');
			Logger.issue('error', error, {
				action: 'lock',
				feature: 'lines',
				request,
			});
			throw error;
		}

		//
		// Validate that user has permission for this line's agency

		const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.lines.actions.lock,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.lines.scope,
			value: [lineData.agency_id],
		});

		if (!hasPermissionForAgency) {
			const error = new Error('You are not authorized to perform this action: toggle lock line');
			Logger.issue('error', error, {
				action: 'lock',
				feature: 'lines',
				request,
			});
			throw error;
		}

		// If authorized, toggle the lock status of the line
		await lines.toggleLockById(request.params.id);
		const foundLine = await lines.findById(request.params.id);
		if (!foundLine) {
			const error = new Error('Line not found');
			Logger.issue('error', error, {
				action: 'lock',
				feature: 'lines',
				request,
			});
			throw error;
		}

		return reply.send({ data: foundLine, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Updates an existing line by ID
	 * @param request Fastify request containing line ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateLineDto, Params: { id: string } }>, reply: FastifyReply<Line>) {
		//

		//
		// Get the Line from the database

		const lineData = await lines.findById(request.params.id);

		if (!lineData) {
			const error = new Error('Line not found');
			Logger.issue('error', error, {
				action: 'update',
				feature: 'lines',
				request,
				statusCode: HTTP_STATUS.NOT_FOUND,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Get the resource permissions for lines for the current user.

		const userLinePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.update);

		//
		// If no permission found, deny access

		if (!userLinePermissions) {
			const error = new Error('You are not authorized to update lines');
			Logger.issue('error', error, {
				action: 'update',
				feature: 'lines',
				request,
				statusCode: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Validate that user has permission for this line's agency

		const hasPermissionForAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.lines.actions.update,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.lines.scope,
			value: [lineData.agency_id],
		});

		if (!hasPermissionForAgency) {
			const error = new Error('You are not authorized to update this line');
			Logger.issue('error', error, {
				action: 'update',
				feature: 'lines',
				request,
				statusCode: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Update the line

		const updatedLine = await lines.updateById(lineData._id, request.body);

		//
		// Send the updated line data as the response

		reply.send({
			data: updatedLine,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}
	//
}
