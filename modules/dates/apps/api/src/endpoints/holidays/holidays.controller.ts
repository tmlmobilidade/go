/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type Filter, holidays } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type CreateHolidayDto, type Holiday, PermissionCatalog, type UpdateHolidayDto } from '@tmlmobilidade/types';

/* * */

export class HolidaysController {
	//

	/**
	 * Creates a new holiday.
	 * @param request Fastify request containing holiday data
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateHolidayDto }>, reply: FastifyReply<Holiday>) {
		//

		//
		// Get the resource permissions for holidays for the current user.

		const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.create);

		//
		// If no permission found, deny access

		if (!userHolidayPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create holidays');
			Logger.error([], {
				action: 'create',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
			});
			throw error;
		}

		//
		// Validate that user has permission for ALL the specified agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.holidays.actions.create,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.holidays.scope,
			value: request.body.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create holidays for these agencies. You must have permission for all agencies involved.');
			Logger.error([], {
				action: 'create',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
			});
			throw error;
		}

		//
		// Create the new holiday

		const newHoliday = await holidays.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newHoliday, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Deletes an holiday by ID
	 * @param request Fastify request containing holiday ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const holiday = await holidays.findById(id);

		if (!holiday) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Holiday not found');
			Logger.error([], {
				action: 'delete',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.NOT_FOUND,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Get the resource permissions for holidays for the current user.

		const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.delete);

		//
		// If no permission found, deny access

		if (!userHolidayPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete holidays');
			Logger.error([], {
				action: 'delete',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Validate that user has permission for ALL of this holiday's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.holidays.actions.delete,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.holidays.scope,
			value: holiday.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this holiday. You must have permission for all agencies involved.');
			Logger.error([], {
				action: 'delete',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		//

		await holidays.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all holidays.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Holiday[]>) {
		//

		//
		// Get the resource permissions for holidays for the current user.

		const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.read);

		//
		// If no permission found, deny access

		if (!userHolidayPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read holidays');
			Logger.error([], {
				action: 'getAll',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
			});
			throw error;
		}

		//
		// Build database query filters based on user permissions

		const queryFilters: Filter<Holiday> = {};

		//
		// If agency IDs are specified in resources and do not include the ALLOW_ALL_FLAG,
		// filter holidays by those agency IDs.

		if ('resources' in userHolidayPermissions && 'agency_ids' in userHolidayPermissions.resources) {
			if (!userHolidayPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
				queryFilters.agency_ids = { $in: userHolidayPermissions.resources['agency_ids'] };
			}
		}

		//
		// Fetch holidays based on query filters

		const allHolidays = await holidays.findMany(queryFilters, { sort: { created_at: -1 } });

		return reply.send({ data: allHolidays, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Retrieves a single holiday by ID
	 * @param request Fastify request containing holiday ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Holiday>) {
		//

		//
		// Get the Holiday from the database

		const holidayData = await holidays.findById(request.params.id);

		if (!holidayData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Holiday not found');
			Logger.error([], {
				action: 'getById',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.NOT_FOUND,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Get the resource permissions for holidays for the current user.

		const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.read);

		//
		// If no permission found, deny access

		if (!userHolidayPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read holidays');
			Logger.error([], {
				action: 'getById',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
			});
			throw error;
		}

		//
		// Validate that user has permission for at least one of this holiday's agencies

		const hasPermissionForAnyAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.holidays.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.holidays.scope,
			value: holidayData.agency_ids,
		});

		if (!hasPermissionForAnyAgency) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this holiday');
			Logger.error([], {
				action: 'getById',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Fetch the holiday data

		return reply.send({
			data: holidayData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of an holiday by ID
	 * @param request Fastify request containing holiday ID in params
	 * @param reply Fastify reply
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Holiday>) {
		//

		//
		// Get the Holiday from the database

		const holidayData = await holidays.findById(request.params.id);

		if (!holidayData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Holiday not found');
			Logger.error([], {
				action: 'lock',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.NOT_FOUND,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Get the resource permissions for holidays for the current user.

		const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.lock);

		//
		// If no permission found, deny access

		if (!userHolidayPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock holidays');
			Logger.error([], {
				action: 'lock',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
			});
			throw error;
		}

		//
		// Validate that user has permission for ALL of this holiday's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.holidays.actions.lock,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.holidays.scope,
			value: holidayData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock holiday. You must have permission for all agencies involved.');
			Logger.error([], {
				action: 'lock',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		// If authorized, toggle the lock status of the holiday
		await holidays.toggleLockById(request.params.id);
		const foundHoliday = await holidays.findById(request.params.id);
		if (!foundHoliday) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Holiday not found');
			Logger.error([], {
				action: 'lock',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.NOT_FOUND,
				value: request.params.id,
			});
			throw error;
		}

		return reply.send({ data: foundHoliday, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Updates an existing holiday by ID
	 * @param request Fastify request containing holiday ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateHolidayDto, Params: { id: string } }>, reply: FastifyReply<Holiday>) {
		//

		//
		// Get the Holiday from the database

		const holidayData = await holidays.findById(request.params.id);

		if (!holidayData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Holiday not found');
			Logger.error([], {
				action: 'update',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.NOT_FOUND,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Get the resource permissions for holidays for the current user.

		const userHolidayPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.holidays.scope, PermissionCatalog.all.holidays.actions.update);

		//
		// If no permission found, deny access

		if (!userHolidayPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update holidays');
			Logger.error([], {
				action: 'update',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Validate that user has permission for ALL of this holiday's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.holidays.actions.update,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.holidays.scope,
			value: holidayData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this holiday. You must have permission for all agencies involved.');
			Logger.error([], {
				action: 'update',
				email: request.me.email,
				feature: 'holidays',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Update the holiday

		const updatedHoliday = await holidays.updateById(holidayData._id, request.body);

		//
		// Send the updated holiday data as the response

		reply.send({
			data: updatedHoliday,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}
	//
}
