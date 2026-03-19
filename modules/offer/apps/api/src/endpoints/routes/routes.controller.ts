/* * */

import { HttpException, HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { patterns, routes } from '@tmlmobilidade/interfaces';
import { CreateRouteDto, PatternSimplified, PermissionCatalog, type Route, type UpdateRouteDto } from '@tmlmobilidade/types';

/* * */

export class RoutesController {
	//

	/**
	 * Creates a new route.
	 * @param request Fastify request containing route data in body
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateRouteDto }>, reply: FastifyReply<Route>) {
		//

		//
		// Get the resource permissions for routes for the current user.

		const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.create);

		//
		// If no permission found, deny access

		if (!userRoutePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create routes');
		}

		//
		// Create the new route

		const newRoute = await routes.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newRoute, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Deletes a route by ID
	 * @param request Fastify request containing route ID
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const route = await routes.findById(id);

		if (!route) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Route not found');
		}

		//
		// Get the resource permissions for routes for the current user.

		const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.delete);

		//
		// If no permission found, deny access

		if (!userRoutePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete routes');
		}

		//

		await routes.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves a single route by ID
	 * @param request Fastify request containing route ID
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Route>) {
		//

		//
		// Get the Route from the database

		const routeData = await routes.findById(request.params.id);

		if (!routeData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Route not found');

		//
		// Get the resource permissions for routes for the current user.

		const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

		//
		// If no permission found, deny access

		if (!userRoutePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read routes');
		}

		//
		// Fetch routes for this line

		const routePatterns = await patterns.findMany(
			{ line_id: routeData.line_id, route_id: request.params.id },
			{ projection: { _id: 1, code: 1, destination: 1, headsign: 1, line_id: 1, origin: 1, route_id: 1 }, sort: { created_at: -1 } },
		) as PatternSimplified[];

		//
		// Fetch the route data

		return reply.send({
			data: { ...routeData, patterns: routePatterns },
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of a route by ID
	 * @param request Fastify request containing route ID
	 * @param reply Fastify reply
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Route>) {
		//

		//
		// Get the Route from the database

		const routeData = await routes.findById(request.params.id);

		if (!routeData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Route not found');

		//
		// Get the resource permissions for routes for the current user.

		const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.lock);

		//
		// If no permission found, deny access

		if (!userRoutePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock routes');
		}

		// If authorized, toggle the lock status of the route
		await routes.toggleLockById(request.params.id);
		const foundRoute = await routes.findById(request.params.id);
		if (!foundRoute) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Route not found');

		return reply.send({ data: foundRoute, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Updates an existing route by ID
	 * @param request Fastify request containing route ID and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateRouteDto, Params: { id: string } }>, reply: FastifyReply<Route>) {
		//

		//
		// Get the Route from the database

		const routeData = await routes.findById(request.params.id);

		if (!routeData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Route not found');

		//
		// Get the resource permissions for routes for the current user.

		const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.update);

		//
		// If no permission found, deny access

		if (!userRoutePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update routes');
		}

		//
		// Update the route

		const updatedRoute = await routes.updateById(routeData._id, request.body);

		//
		// Send the updated route data as the response

		reply.send({
			data: updatedRoute,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}
	//
}
