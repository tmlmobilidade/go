/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { routes } from '@tmlmobilidade/interfaces';
import { CreateRouteDto, PermissionCatalog, type Route, type UpdateRouteDto } from '@tmlmobilidade/types';

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
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to create routes');
		}

		//
		// Create the new route

		const newRoute = await routes.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newRoute, error: null, statusCode: HttpStatus.OK });

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
			throw new HttpException(HttpStatus.NOT_FOUND, 'Route not found');
		}

		//
		// Get the resource permissions for routes for the current user.

		const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.delete);

		//
		// If no permission found, deny access

		if (!userRoutePermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to delete routes');
		}

		//

		await routes.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
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

		if (!routeData) throw new HttpException(HttpStatus.NOT_FOUND, 'Route not found');

		//
		// Get the resource permissions for routes for the current user.

		const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.read);

		//
		// If no permission found, deny access

		if (!userRoutePermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read routes');
		}

		//
		// Fetch the route data

		return reply.send({
			data: routeData,
			error: null,
			statusCode: HttpStatus.OK,
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

		if (!routeData) throw new HttpException(HttpStatus.NOT_FOUND, 'Route not found');

		//
		// Get the resource permissions for routes for the current user.

		const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.lock);

		//
		// If no permission found, deny access

		if (!userRoutePermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to lock/unlock routes');
		}

		// If authorized, toggle the lock status of the route
		await routes.toggleLockById(request.params.id);
		const foundRoute = await routes.findById(request.params.id);
		if (!foundRoute) throw new HttpException(HttpStatus.NOT_FOUND, 'Route not found');

		return reply.send({ data: foundRoute, error: null, statusCode: HttpStatus.OK });

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

		if (!routeData) throw new HttpException(HttpStatus.NOT_FOUND, 'Route not found');

		//
		// Get the resource permissions for routes for the current user.

		const userRoutePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.lines.scope, PermissionCatalog.all.lines.actions.update);

		//
		// If no permission found, deny access

		if (!userRoutePermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to update routes');
		}

		//
		// Update the route

		const updatedRoute = await routes.updateById(routeData._id, request.body);

		//
		// Send the updated route data as the response

		reply.send({
			data: updatedRoute,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}
	//
}
