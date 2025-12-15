/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { periods } from '@tmlmobilidade/interfaces';
import { type CreatePeriodDto, type Period, PermissionCatalog, type UpdatePeriodDto } from '@tmlmobilidade/types';

/* * */

export class PeriodsController {
	//

	/**
	 * Creates a new period.
	 * @param request Fastify request containing period data
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreatePeriodDto }>, reply: FastifyReply<Period>) {
		//

		//
		// Check if the user has permission to create periods

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.dates.scope, PermissionCatalog.all.dates.actions.create_periods)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to create periods');
		}

		//
		// Create the new period

		const newPeriod = await periods.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newPeriod, error: null, statusCode: HttpStatus.OK });

		//
	}

	/**
	 * Deletes a period by ID
	 * @param request Fastify request containing period ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const period = await periods.findById(id);

		if (!period) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Period not found');
		}

		//
		// Check if the user has permission to delete periods

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.dates.scope, PermissionCatalog.all.dates.actions.delete_periods)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to delete periods');
		}

		//

		await periods.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Retrieves all periods.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Period[]>) {
		//

		//
		// Check if the user has permission to read periods

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.dates.scope, PermissionCatalog.all.dates.actions.read_periods)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read periods');
		}

		//
		// Fetch all periods

		const allPeriods = await periods.findMany({}, { sort: { start_date: -1 } });

		return reply.send({ data: allPeriods, error: null, statusCode: HttpStatus.OK });

		//
	}

	/**
	 * Retrieves a single period by ID
	 * @param request Fastify request containing period ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Period>) {
		//

		//
		// Get the Period from the database

		const periodData = await periods.findById(request.params.id);

		if (!periodData) throw new HttpException(HttpStatus.NOT_FOUND, 'Period not found');

		//
		// Check if the user has permission to read periods

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.dates.scope, PermissionCatalog.all.dates.actions.read_periods)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read periods');
		}

		//
		// Fetch the period data

		return reply.send({
			data: periodData,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of a period by ID
	 * @param request Fastify request containing period ID in params
	 * @param reply Fastify reply
	 */
	static async toggleLockById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Period>) {
		//

		//
		// Get the Period from the database

		const periodData = await periods.findById(request.params.id);

		if (!periodData) throw new HttpException(HttpStatus.NOT_FOUND, 'Period not found');

		//
		// Check if the user has permission to toggle lock the Period

		const hasPermissionToggleLockPeriod = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.dates.actions.toggle_lock_periods,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.dates.scope,
			value: periodData.agency_id,
		});

		if (!hasPermissionToggleLockPeriod) throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action: toggle lock period');

		//
		// Toggle the lock status of the period

		const result = await periods.updateById(periodData._id, { is_locked: !periodData.is_locked });

		return reply.send({
			data: result,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	/**
	 * Updates an existing period by ID
	 * @param request Fastify request containing period ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdatePeriodDto, Params: { id: string } }>, reply: FastifyReply<Period>) {
		//

		//
		// Get the Period from the database

		const periodData = await periods.findById(request.params.id);

		if (!periodData) throw new HttpException(HttpStatus.NOT_FOUND, 'Period not found');

		//
		// Check if the user has permission to update periods

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.dates.scope, PermissionCatalog.all.dates.actions.update_periods)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to update periods');
		}

		//
		// Update the period

		const updatedPeriod = await periods.updateById(periodData._id, request.body);

		//
		// Send the updated period data as the response

		reply.send({
			data: updatedPeriod,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}
	//
}
