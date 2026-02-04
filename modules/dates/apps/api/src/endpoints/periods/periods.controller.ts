/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { findCommonDates, mergeDateArrays, removeDatesFromArray } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type Filter, periods } from '@tmlmobilidade/interfaces';
import { type CreatePeriodDto, OperationalDate, type Period, PermissionCatalog, type UpdatePeriodDto } from '@tmlmobilidade/types';

/* * */

export class PeriodsController {
	//

	/**
	 * Check for date conflicts with existing periods.
	 * Returns information about which periods would be affected by assigning the given dates.
	 * @param request Fastify request containing dates and optional period_id
	 * @param reply Fastify reply
	 */
	static async checkConflicts(
		request: FastifyRequest<{
			Body: {
				agency_ids: string[]
				dates: OperationalDate[]
				period_id?: string
			}
		}>,
		reply: FastifyReply<{ conflicts: { dates: OperationalDate[], period: Period }[] }>,
	) {
		//

		//
		// Get the resource permissions for periods for the current user.

		const userPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.periods.scope, PermissionCatalog.all.periods.actions.read);

		//
		// If no permission found, deny access

		if (!userPeriodPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read periods');
		}

		//
		// Validate that user has permission for ALL specified agencies

		if ('resources' in userPeriodPermissions && 'agency_ids' in userPeriodPermissions.resources) {
			const userAgencyIds = userPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			if (!hasAllowAll) {
				// Check that user has permission for all requested agencies
				const hasAllAgencies = request.body.agency_ids.every(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAllAgencies) {
					throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read periods for all specified agencies');
				}
			}
		}

		//
		// Get parameters

		const { agency_ids, dates: newDates, period_id } = request.body;

		//
		// Find all periods that have at least one matching agency (excluding the current period if provided)

		const query: Filter<Period> = {
			agency_ids: { $in: agency_ids },
		};
		if (period_id) {
			query._id = { $ne: period_id };
		}

		const agencyPeriods = await periods.findMany(query);

		//
		// Helper function to check if two agency arrays are exactly the same (regardless of order)

		const areAgencySetsEqual = (set1: string[], set2: string[]) => {
			if (set1.length !== set2.length) return false;
			const sorted1 = [...set1].sort();
			const sorted2 = [...set2].sort();
			return sorted1.every((id, index) => id === sorted2[index]);
		};

		//
		// Find conflicts
		// A conflict only occurs when EXACTLY the same set of agencies is used
		// Different agency combinations can coexist on the same dates

		const conflicts: { dates: OperationalDate[], period: Period }[] = [];

		for (const otherPeriod of agencyPeriods) {
			if (!otherPeriod.dates || otherPeriod.dates.length === 0) continue;

			// Only consider it a conflict if the agency sets are EXACTLY the same
			if (!areAgencySetsEqual(agency_ids, otherPeriod.agency_ids)) continue;

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
		// Get the resource permissions for periods for the current user.

		const userPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.periods.scope, PermissionCatalog.all.periods.actions.create);

		//
		// If no permission found, deny access

		if (!userPeriodPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to create periods');
		}

		//
		// Validate that user has permission for ALL specified agencies

		if ('resources' in userPeriodPermissions && 'agency_ids' in userPeriodPermissions.resources) {
			const userAgencyIds = userPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			if (!hasAllowAll) {
				const hasAllAgencies = request.body.agency_ids.every(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAllAgencies) {
					throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to create periods for all specified agencies');
				}
			}
		}

		//
		// If dates are provided, handle conflicts with other periods of the same agency set

		if (request.body.dates && request.body.dates.length > 0) {
			const newDates = request.body.dates as OperationalDate[];
			request.body.dates = await PeriodsController.handleDateAssignment(request.body.agency_ids, newDates);
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
		// Get the resource permissions for periods for the current user.

		const userPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.periods.scope, PermissionCatalog.all.periods.actions.delete);

		//
		// If no permission found, deny access

		if (!userPeriodPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to delete periods');
		}

		//
		// Validate that user has permission for this period's agency

		if ('resources' in userPeriodPermissions && 'agency_ids' in userPeriodPermissions.resources) {
			const userAgencyIds = userPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			// User needs access to ALL agencies to delete
			if (!hasAllowAll) {
				const hasAllAgencies = period.agency_ids.every(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAllAgencies) {
					throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to delete this period');
				}
			}
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
		// Get the resource permissions for periods for the current user.

		const userPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.periods.scope, PermissionCatalog.all.periods.actions.read);

		//
		// If no permission found, deny access

		if (!userPeriodPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read periods');
		}

		//
		// Build database query filters based on user permissions

		const queryFilters: Filter<Period> = {};

		//
		// If agency IDs are specified in resources and do not include the ALLOW_ALL_FLAG,
		// filter periods by those agency IDs.

		if ('resources' in userPeriodPermissions && 'agency_ids' in userPeriodPermissions.resources) {
			if (!userPeriodPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
				queryFilters.agency_ids = { $in: userPeriodPermissions.resources['agency_ids'] };
			}
		}

		//
		// Fetch periods based on query filters

		const allPeriods = await periods.findMany(queryFilters, { sort: { start_date: -1 } });

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
		// Get the resource permissions for periods for the current user.

		const userPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.periods.scope, PermissionCatalog.all.periods.actions.read);

		//
		// If no permission found, deny access

		if (!userPeriodPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read periods');
		}

		//
		// Validate that user has permission for this period's agency

		if ('resources' in userPeriodPermissions && 'agency_ids' in userPeriodPermissions.resources) {
			const userAgencyIds = userPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			// User can read if they have access to at least ONE agency
			if (!hasAllowAll) {
				const hasAnyAgency = periodData.agency_ids.some(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAnyAgency) {
					throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read this period');
				}
			}
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
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Period>) {
		//

		//
		// Get the Period from the database

		const periodData = await periods.findById(request.params.id);

		if (!periodData) throw new HttpException(HttpStatus.NOT_FOUND, 'Period not found');

		//
		// Get the resource permissions for periods for the current user.

		const userPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.periods.scope, PermissionCatalog.all.periods.actions.lock);

		//
		// If no permission found, deny access

		if (!userPeriodPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to lock/unlock periods');
		}

		//
		// Validate that user has permission for this period's agency

		if ('resources' in userPeriodPermissions && 'agency_ids' in userPeriodPermissions.resources) {
			const userAgencyIds = userPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			// User needs access to ALL agencies to lock
			if (!hasAllowAll) {
				const hasAllAgencies = periodData.agency_ids.every(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAllAgencies) {
					throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to perform this action: toggle lock period');
				}
			}
		}

		//
		// Toggle the lock status of the period

		await periods.toggleLockById(request.params.id);
		const updatedPeriod = await periods.findById(request.params.id);
		if (!updatedPeriod) throw new HttpException(HttpStatus.NOT_FOUND, 'Period not found');

		return reply.send({
			data: updatedPeriod,
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
		// Get the resource permissions for periods for the current user.

		const userPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.periods.scope, PermissionCatalog.all.periods.actions.update);

		//
		// If no permission found, deny access

		if (!userPeriodPermissions) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to update periods');
		}

		//
		// Validate that user has permission for this period's agency

		if ('resources' in userPeriodPermissions && 'agency_ids' in userPeriodPermissions.resources) {
			const userAgencyIds = userPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			// User needs access to ALL agencies to lock
			if (!hasAllowAll) {
				const hasAllAgencies = periodData.agency_ids.every(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAllAgencies) {
					throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to lock/unlock this period');
				}
			}
		}

		//
		// If dates are provided, handle conflicts with other periods of the same agency

		if (request.body.dates && request.body.dates.length > 0) {
			const newDates = request.body.dates as OperationalDate[];
			const existingDates = periodData.dates || [];
			request.body.dates = await PeriodsController.handleDateAssignment(
				periodData.agency_ids,
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
	 * Merges new dates with existing dates and removes conflicts from other periods with the EXACT same agency set.
	 * @param agencyIds - Array of agency IDs
	 * @param newDates - Array of new dates to assign
	 * @param periodId - Optional period ID to exclude from conflict resolution (for updates)
	 * @param existingDates - Optional array of existing dates to merge with
	 * @returns The merged dates array
	 */
	private static async handleDateAssignment(
		agencyIds: string[],
		newDates: OperationalDate[],
		periodId?: string,
		existingDates: OperationalDate[] = [],
	): Promise<OperationalDate[]> {
		//

		//
		// Merge with existing dates if provided

		const mergedDates = existingDates.length > 0 ? mergeDateArrays(existingDates, newDates) : newDates;

		//
		// Find all periods that have at least one matching agency (excluding the current period if provided)

		const query: Filter<Period> = {
			agency_ids: { $in: agencyIds },
		};
		if (periodId) {
			query._id = { $ne: periodId };
		}

		const agencyPeriods = await periods.findMany(query);

		//
		// Helper function to check if two agency arrays are exactly the same (regardless of order)

		const areAgencySetsEqual = (set1: string[], set2: string[]) => {
			if (set1.length !== set2.length) return false;
			const sorted1 = [...set1].sort();
			const sorted2 = [...set2].sort();
			return sorted1.every((id, index) => id === sorted2[index]);
		};

		//
		// For each period with EXACT same agency set and overlapping dates, remove the conflicting dates

		for (const otherPeriod of agencyPeriods) {
			if (!otherPeriod.dates || otherPeriod.dates.length === 0) continue;

			// Only handle conflicts for periods with EXACTLY the same agency set
			if (!areAgencySetsEqual(agencyIds, otherPeriod.agency_ids)) continue;

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
