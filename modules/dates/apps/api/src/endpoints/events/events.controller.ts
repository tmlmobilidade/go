/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { events, type Filter, patterns } from '@tmlmobilidade/interfaces';
import { type CreateEventDto, type Event, PermissionCatalog, type UpdateEventDto } from '@tmlmobilidade/types';

/* * */

export class EventsController {
	//

	/**
	 * Creates a new event.
	 * @param request Fastify request containing event data
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateEventDto }>, reply: FastifyReply<Event>) {
		//

		//
		// Get the resource permissions for events for the current user.

		const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.create);

		//
		// If no permission found, deny access

		if (!userEventPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create events');
		}

		//
		// Validate that user has permission for ALL the specified agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.events.actions.create,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.events.scope,
			value: request.body.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create events for these agencies. You must have permission for all agencies involved.');
		}

		//
		// Create the new event

		const newEvent = await events.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newEvent, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Deletes an event by ID
	 * @param request Fastify request containing event ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const event = await events.findById(id);

		if (!event) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Event not found');
		}

		//
		// Get the resource permissions for events for the current user.

		const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.delete);

		//
		// If no permission found, deny access

		if (!userEventPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete events');
		}

		//
		// Validate that user has permission for ALL of this event's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.events.actions.delete,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.events.scope,
			value: event.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this event. You must have permission for all agencies involved.');
		}

		//

		await events.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all events.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Event[]>) {
		//

		//
		// Get the resource permissions for events for the current user.

		const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.read);

		//
		// If no permission found, deny access

		if (!userEventPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read events');
		}

		//
		// Build database query filters based on user permissions

		const queryFilters: Filter<Event> = {};

		//
		// If agency IDs are specified in resources and do not include the ALLOW_ALL_FLAG,
		// filter events by those agency IDs.

		if ('resources' in userEventPermissions && 'agency_ids' in userEventPermissions.resources) {
			if (!userEventPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
				queryFilters.agency_ids = { $in: userEventPermissions.resources['agency_ids'] };
			}
		}

		//
		// Fetch events based on query filters

		const allEvents = await events.findMany(queryFilters, { sort: { created_at: -1 } });

		return reply.send({ data: allEvents, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Retrieves a single event by ID
	 * @param request Fastify request containing event ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Event>) {
		//

		//
		// Get the Event from the database

		const eventData = await events.findById(request.params.id);

		if (!eventData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Event not found');

		//
		// Get the resource permissions for events for the current user.

		const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.read);

		//
		// If no permission found, deny access

		if (!userEventPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read events');
		}

		//
		// Validate that user has permission for at least one of this event's agencies

		const hasPermissionForAnyAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.events.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.events.scope,
			value: eventData.agency_ids,
		});

		if (!hasPermissionForAnyAgency) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this event');
		}

		//
		// Get pattern ids that reference this event in manual pattern rules

		const associatedPatterns = await patterns.findMany(
			{
				rules: {
					$elemMatch: {
						event_id: request.params.id,
						kind: 'manual',
					},
				},
			},
			{
				projection: {
					_id: 1,
					code: 1,
					headsign: 1,
					line_id: 1,
					route_id: 1,
				},
				sort: { code: 1 },
			},
		);

		//
		// Fetch the event data

		return reply.send({
			data: {
				...eventData,
				associated_patterns: associatedPatterns,
			},
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of an event by ID
	 * @param request Fastify request containing event ID in params
	 * @param reply Fastify reply
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Event>) {
		//

		//
		// Get the Event from the database

		const eventData = await events.findById(request.params.id);

		if (!eventData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Event not found');

		//
		// Get the resource permissions for events for the current user.

		const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.lock);

		//
		// If no permission found, deny access

		if (!userEventPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock events');
		}

		//
		// Validate that user has permission for ALL of this event's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.events.actions.lock,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.events.scope,
			value: eventData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock event. You must have permission for all agencies involved.');
		}

		// If authorized, toggle the lock status of the event
		await events.toggleLockById(request.params.id);
		const foundEvent = await events.findById(request.params.id);
		if (!foundEvent) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Event not found');

		return reply.send({ data: foundEvent, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Updates an existing event by ID
	 * @param request Fastify request containing event ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateEventDto, Params: { id: string } }>, reply: FastifyReply<Event>) {
		//

		//
		// Get the Event from the database

		const eventData = await events.findById(request.params.id);

		if (!eventData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Event not found');

		//
		// Get the resource permissions for events for the current user.

		const userEventPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.events.scope, PermissionCatalog.all.events.actions.update);

		//
		// If no permission found, deny access

		if (!userEventPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update events');
		}

		//
		// Validate that user has permission for ALL of this event's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.events.actions.update,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.events.scope,
			value: eventData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this event. You must have permission for all agencies involved.');
		}

		//
		// Update the event

		const updatedEvent = await events.updateById(eventData._id, request.body);

		//
		// Send the updated event data as the response

		reply.send({
			data: updatedEvent,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}
	//
}
