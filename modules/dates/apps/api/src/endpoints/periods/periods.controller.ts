/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { findCommonDates, mergeDateArrays, removeDatesFromArray } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { periods } from '@tmlmobilidade/interfaces';
import { type CreatePeriodDto, OperationalDate, type Period, PermissionCatalog, type UpdatePeriodDto } from '@tmlmobilidade/types';

/* * */

export class PeriodsController {
	//

	/**
	 * Check for date conflicts with existing periods.
	 * Returns information about which periods would be affected by assigning the given dates.
	 * @param request Fastify request containing agency_id, dates, and optional period_id
	 * @param reply Fastify reply
	 */
	static async checkConflicts(
		request: FastifyRequest<{
			Body: {
				agency_id: string
				dates: OperationalDate[]
				period_id?: string
			}
		}>,
		reply: FastifyReply<{ conflicts: { dates: OperationalDate[], period: Period }[] }>,
	) {
		//

		//
		// Check if the user has permission to read periods

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.dates.scope, PermissionCatalog.all.dates.actions.read_periods)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read periods');
		}

		//
		// Get parameters

		const { agency_id, dates: newDates, period_id } = request.body;

		//
		// Find all periods for the same agency (excluding the current period if provided)

		const query: { _id?: { $ne: string }, agency_id: string } = { agency_id };
		if (period_id) {
			query._id = { $ne: period_id };
		}

		const agencyPeriods = await periods.findMany(query);

		//
		// Find conflicts

		const conflicts: { dates: OperationalDate[], period: Period }[] = [];

		for (const otherPeriod of agencyPeriods) {
			if (!otherPeriod.dates || otherPeriod.dates.length === 0) continue;

			// Find dates that conflict between the new dates and this period
			const conflictingDates = findCommonDates(newDates, otherPeriod.dates);

			if (conflictingDates.length > 0) {
				conflicts.push({
					dates: conflictingDates,
					period: otherPeriod,
				});
			}
		}

		//
		// Return conflicts

		return reply.send({
			data: { conflicts },
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	/**
	 * Creates a new period.
	 * If dates are provided, handles conflicts by removing those dates from other periods of the same agency.
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
		// If dates are provided, handle conflicts with other periods of the same agency

		if (request.body.dates && request.body.dates.length > 0) {
			const newDates = request.body.dates as OperationalDate[];
			request.body.dates = await PeriodsController.handleDateAssignment(request.body.agency_id, newDates);
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
	 * Updates an existing period by ID.
	 * If dates are provided, merges with existing dates and handles conflicts by removing those dates from other periods of the same agency.
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
		// If dates are provided, handle conflicts with other periods of the same agency

		if (request.body.dates && request.body.dates.length > 0) {
			const newDates = request.body.dates as OperationalDate[];
			const existingDates = periodData.dates || [];
			request.body.dates = await PeriodsController.handleDateAssignment(
				periodData.agency_id,
				newDates,
				periodData._id,
				existingDates,
			);
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

	/**
	 * Utility function to handle date assignment with conflict resolution.
	 * Merges new dates with existing dates and removes conflicts from other periods of the same agency.
	 * @param agencyId - The agency ID
	 * @param newDates - Array of new dates to assign
	 * @param periodId - Optional period ID to exclude from conflict resolution (for updates)
	 * @param existingDates - Optional array of existing dates to merge with
	 * @returns The merged dates array
	 */
	private static async handleDateAssignment(
		agencyId: string,
		newDates: OperationalDate[],
		periodId?: string,
		existingDates: OperationalDate[] = [],
	): Promise<OperationalDate[]> {
		//

		//
		// Merge with existing dates if provided

		const mergedDates = existingDates.length > 0 ? mergeDateArrays(existingDates, newDates) : newDates;

		//
		// Find all periods for the same agency (excluding the current period if provided)

		const query: { _id?: { $ne: string }, agency_id: string } = { agency_id: agencyId };
		if (periodId) {
			query._id = { $ne: periodId };
		}

		const agencyPeriods = await periods.findMany(query);

		//
		// For each period with overlapping dates, remove the conflicting dates

		for (const otherPeriod of agencyPeriods) {
			if (!otherPeriod.dates || otherPeriod.dates.length === 0) continue;

			// Find dates that conflict between the merged dates and this period
			const conflicts = findCommonDates(mergedDates, otherPeriod.dates);

			if (conflicts.length > 0) {
				// Remove conflicting dates from this period
				const updatedDates = removeDatesFromArray(otherPeriod.dates, conflicts);
				await periods.updateById(otherPeriod._id, { dates: updatedDates });
			}
		}

		//
		// Return the merged dates

		return mergedDates;

		//
	}
	//
}
