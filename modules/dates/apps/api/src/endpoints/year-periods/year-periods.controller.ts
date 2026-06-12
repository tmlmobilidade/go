/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { findCommonDates, mergeDateArrays, removeDatesFromArray } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type Filter, yearPeriods } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type CreateYearPeriodDto, OperationalDate, PermissionCatalog, type UpdateYearPeriodDto, type YearPeriod } from '@tmlmobilidade/types';

/* * */

export class YearPeriodsController {
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
				year_period_id?: string
			}
		}>,
		reply: FastifyReply<{ conflicts: { dates: OperationalDate[], year_period: YearPeriod }[] }>,
	) {
		//

		//
		// Get the resource permissions for year periods for the current user.

		const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.read);

		//
		// If no permission found, deny access

		if (!userYearPeriodPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read year periods');
			Logger.error([], {
				action: 'checkConflicts',
				email: request.me.email,
				feature: 'year_periods',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
			});
			throw error;
		}

		//
		// Validate that user has permission for ALL specified agencies

		if ('resources' in userYearPeriodPermissions && 'agency_ids' in userYearPeriodPermissions.resources) {
			const userAgencyIds = userYearPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			if (!hasAllowAll) {
				// Check that user has permission for all requested agencies
				const hasAllAgencies = request.body.agency_ids.every(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAllAgencies) {
					const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read periods for all specified agencies');
					Logger.error([], {
						action: 'checkConflicts',
						email: request.me.email,
						feature: 'year_periods',
						message: error.message,
						request,
						status: HTTP_STATUS.FORBIDDEN,
					});
					throw error;
				}
			}
		}

		//
		// Get parameters

		const { agency_ids, dates: newDates, year_period_id } = request.body;

		//
		// Find all periods that have at least one matching agency (excluding the current period if provided)

		const query: Filter<YearPeriod> = {
			agency_ids: { $in: agency_ids },
		};
		if (year_period_id) {
			query._id = { $ne: year_period_id };
		}

		const agencyPeriods = await yearPeriods.findMany(query);

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

		const conflicts: { dates: OperationalDate[], year_period: YearPeriod }[] = [];

		for (const otherPeriod of agencyPeriods) {
			if (!otherPeriod.dates || otherPeriod.dates.length === 0) continue;

			// Only consider it a conflict if the agency sets are EXACTLY the same
			if (!areAgencySetsEqual(agency_ids, otherPeriod.agency_ids)) continue;

			// Find dates that conflict between the new dates and this year period
			const conflictingDates = findCommonDates(newDates, otherPeriod.dates);

			if (conflictingDates.length > 0) {
				conflicts.push({
					dates: conflictingDates,
					year_period: otherPeriod,
				});
			}
		}

		//
		// Return conflicts

		return reply.send({
			data: { conflicts },
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Creates a new period.
	 * If dates are provided, handles conflicts by removing those dates from other periods of the same agency.
	 * @param request Fastify request containing period data
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateYearPeriodDto }>, reply: FastifyReply<YearPeriod>) {
		//

		//
		// Get the resource permissions for periods for the current user.

		const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.create);

		//
		// If no permission found, deny access

		if (!userYearPeriodPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create periods');
			Logger.error([], {
				action: 'create',
				email: request.me.email,
				feature: 'year_periods',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
			});
			throw error;
		}

		//
		// Validate that user has permission for ALL specified agencies

		if ('resources' in userYearPeriodPermissions && 'agency_ids' in userYearPeriodPermissions.resources) {
			const userAgencyIds = userYearPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			if (!hasAllowAll) {
				const hasAllAgencies = request.body.agency_ids.every(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAllAgencies) {
					const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create periods for all specified agencies');
					Logger.error([], {
						action: 'create',
						email: request.me.email,
						feature: 'year_periods',
						message: error.message,
						request,
						status: HTTP_STATUS.FORBIDDEN,
					});
					throw error;
				}
			}
		}

		//
		// If dates are provided, handle conflicts with other periods of the same agency set

		if (request.body.dates && request.body.dates.length > 0) {
			const newDates = request.body.dates as OperationalDate[];
			request.body.dates = await YearPeriodsController.handleDateAssignment(request.body.agency_ids, newDates);
		}

		//
		// Create the new period

		const newPeriod = await yearPeriods.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newPeriod, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Deletes a period by ID
	 * @param request Fastify request containing period ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const period = await yearPeriods.findById(id);

		if (!period) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'YearPeriod not found');
			Logger.error([], {
				action: 'delete',
				email: request.me.email,
				feature: 'year_periods',
				message: error.message,
				request,
				status: HTTP_STATUS.NOT_FOUND,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Get the resource permissions for periods for the current user.

		const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.delete);
		//
		// If no permission found, deny access

		if (!userYearPeriodPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete year periods');
			Logger.error([], {
				action: 'delete',
				email: request.me.email,
				feature: 'year_periods',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Validate that user has permission for this period's agency

		if ('resources' in userYearPeriodPermissions && 'agency_ids' in userYearPeriodPermissions.resources) {
			const userAgencyIds = userYearPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			// User needs access to ALL agencies to delete
			if (!hasAllowAll) {
				const hasAllAgencies = period.agency_ids.every(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAllAgencies) {
					const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this period');
					Logger.error([], {
						action: 'delete',
						email: request.me.email,
						feature: 'year_periods',
						message: error.message,
						request,
						status: HTTP_STATUS.FORBIDDEN,
						value: request.params.id,
					});
					throw error;
				}
			}
		}

		//

		await yearPeriods.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all periods.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<YearPeriod[]>) {
		//

		//
		// Get the resource permissions for year periods for the current user.

		const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.read);

		//
		// If no permission found, deny access

		if (!userYearPeriodPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read year periods');
			Logger.error([], {
				action: 'getAll',
				email: request.me.email,
				feature: 'year_periods',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
			});
		}

		//
		// Build database query filters based on user permissions

		const queryFilters: Filter<YearPeriod> = {};

		//
		// If agency IDs are specified in resources and do not include the ALLOW_ALL_FLAG,
		// filter year periods by those agency IDs.

		if ('resources' in userYearPeriodPermissions && 'agency_ids' in userYearPeriodPermissions.resources) {
			if (!userYearPeriodPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
				queryFilters.agency_ids = { $in: userYearPeriodPermissions.resources['agency_ids'] };
			}
		}

		//
		// Fetch year periods based on query filters

		const allYearPeriods = await yearPeriods.findMany(queryFilters, { sort: { start_date: -1 } });
		return reply.send({ data: allYearPeriods, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Retrieves a single year period by ID
	 * @param request Fastify request containing year period ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<YearPeriod>) {
		//

		//
		// Get the YearPeriod from the database

		const periodData = await yearPeriods.findById(request.params.id);
		if (!periodData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'YearPeriod not found');

		//
		// Get the resource permissions for year periods for the current user.

		const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.read);

		//
		// If no permission found, deny access

		if (!userYearPeriodPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read year periods');
			Logger.error([], {
				action: 'getById',
				email: request.me.email,
				feature: 'year_periods',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Validate that user has permission for this period's agency

		if ('resources' in userYearPeriodPermissions && 'agency_ids' in userYearPeriodPermissions.resources) {
			const userAgencyIds = userYearPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			// User can read if they have access to at least ONE agency
			if (!hasAllowAll) {
				const hasAnyAgency = periodData.agency_ids.some(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAnyAgency) {
					const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this year period');
					Logger.error([], {
						action: 'getById',
						email: request.me.email,
						feature: 'year_periods',
						message: error.message,
						request,
						status: HTTP_STATUS.FORBIDDEN,
						value: request.params.id,
					});
					throw error;
				}
			}
		}

		//
		// Fetch the period data

		return reply.send({
			data: periodData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of a period by ID
	 * @param request Fastify request containing period ID in params
	 * @param reply Fastify reply
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<YearPeriod>) {
		//

		//
		// Get the YearPeriod from the database

		const periodData = await yearPeriods.findById(request.params.id);

		if (!periodData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'YearPeriod not found');
			Logger.error([], {
				action: 'lock',
				email: request.me.email,
				feature: 'year_periods',
				message: error.message,
				request,
				status: HTTP_STATUS.NOT_FOUND,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Get the resource permissions for year periods for the current user.

		const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.lock);
		//
		// If no permission found, deny access

		if (!userYearPeriodPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock year periods');
			Logger.error([], {
				action: 'lock',
				email: request.me.email,
				feature: 'year_periods',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Validate that user has permission for this period's agency

		if ('resources' in userYearPeriodPermissions && 'agency_ids' in userYearPeriodPermissions.resources) {
			const userAgencyIds = userYearPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			// User needs access to ALL agencies to lock
			if (!hasAllowAll) {
				const hasAllAgencies = periodData.agency_ids.every(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAllAgencies) {
					const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock period');
					Logger.error([], {
						action: 'lock',
						email: request.me.email,
						feature: 'year_periods',
						message: error.message,
						request,
						status: HTTP_STATUS.FORBIDDEN,
						value: request.params.id,
					});
					throw error;
				}
			}
		}

		//
		// Toggle the lock status of the period

		await yearPeriods.toggleLockById(request.params.id);
		const updatedPeriod = await yearPeriods.findById(request.params.id);
		if (!updatedPeriod) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'YearPeriod not found');
			Logger.error([], {
				action: 'lock',
				email: request.me.email,
				feature: 'year_periods',
				message: error.message,
				request,
				status: HTTP_STATUS.NOT_FOUND,
				value: request.params.id,
			});
			throw error;
		}

		return reply.send({
			data: updatedPeriod,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Updates an existing period by ID.
	 * If dates are provided, merges with existing dates and handles conflicts by removing those dates from other periods of the same agency.
	 * @param request Fastify request containing period ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateYearPeriodDto, Params: { id: string } }>, reply: FastifyReply<YearPeriod>) {
		//

		//
		// Get the YearPeriod from the database

		const periodData = await yearPeriods.findById(request.params.id);

		if (!periodData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'YearPeriod not found');
			Logger.error([], {
				action: 'update',
				email: request.me.email,
				feature: 'year_periods',
				message: error.message,
				request,
				status: HTTP_STATUS.NOT_FOUND,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Get the resource permissions for year periods for the current user.

		const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.update);
		//
		// If no permission found, deny access

		if (!userYearPeriodPermissions) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update year periods');
			Logger.error([], {
				action: 'update',
				email: request.me.email,
				feature: 'year_periods',
				message: error.message,
				request,
				status: HTTP_STATUS.FORBIDDEN,
				value: request.params.id,
			});
			throw error;
		}

		//
		// Validate that user has permission for this period's agency

		if ('resources' in userYearPeriodPermissions && 'agency_ids' in userYearPeriodPermissions.resources) {
			const userAgencyIds = userYearPeriodPermissions.resources['agency_ids'];
			const hasAllowAll = userAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG);

			// User needs access to ALL agencies to lock
			if (!hasAllowAll) {
				const hasAllAgencies = periodData.agency_ids.every(agencyId => userAgencyIds.includes(agencyId));
				if (!hasAllAgencies) {
					const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock this period');
					Logger.error([], {
						action: 'update',
						email: request.me.email,
						feature: 'year_periods',
						message: error.message,
						request,
						status: HTTP_STATUS.FORBIDDEN,
						value: request.params.id,
					});
					throw error;
				}
			}
		}

		//
		// If dates are provided, handle conflicts with other periods of the same agency

		if (request.body.dates && request.body.dates.length > 0) {
			const newDates = request.body.dates as OperationalDate[];
			const existingDates = periodData.dates || [];
			request.body.dates = await YearPeriodsController.handleDateAssignment(
				periodData.agency_ids,
				newDates,
				periodData._id,
				existingDates,
			);
		}

		//
		// Update the period

		const updatedPeriod = await yearPeriods.updateById(periodData._id, request.body);

		//
		// Send the updated period data as the response

		reply.send({
			data: updatedPeriod,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Utility function to handle date assignment with conflict resolution.
	 * Merges new dates with existing dates and removes conflicts from other year periods with the EXACT same agency set.
	 * @param agencyIds - Array of agency IDs
	 * @param newDates - Array of new dates to assign
	 * @param yearPeriodId - Optional period ID to exclude from conflict resolution (for updates)
	 * @param existingDates - Optional array of existing dates to merge with
	 * @returns The merged dates array
	 */
	private static async handleDateAssignment(
		agencyIds: string[],
		newDates: OperationalDate[],
		yearPeriodId?: string,
		existingDates: OperationalDate[] = [],
	): Promise<OperationalDate[]> {
		//

		//
		// Merge with existing dates if provided

		const mergedDates = existingDates.length > 0 ? mergeDateArrays(existingDates, newDates) : newDates;

		//
		// Find all periods that have at least one matching agency (excluding the current period if provided)

		const query: Filter<YearPeriod> = {
			agency_ids: { $in: agencyIds },
		};
		if (yearPeriodId) {
			query._id = { $ne: yearPeriodId };
		}

		const agencyPeriods = await yearPeriods.findMany(query);

		//
		// Helper function to check if two agency arrays are exactly the same (regardless of order)

		const areAgencySetsEqual = (set1: string[], set2: string[]) => {
			if (set1.length !== set2.length) return false;
			const sorted1 = [...set1].sort();
			const sorted2 = [...set2].sort();
			return sorted1.every((id, index) => id === sorted2[index]);
		};

		//
		// For each year period with EXACT same agency set and overlapping dates, remove the conflicting dates

		for (const otherPeriod of agencyPeriods) {
			if (!otherPeriod.dates || otherPeriod.dates.length === 0) continue;

			// Only handle conflicts for year periods with EXACTLY the same agency set
			if (!areAgencySetsEqual(agencyIds, otherPeriod.agency_ids)) continue;

			// Find dates that conflict between the merged dates and this year period
			const conflicts = findCommonDates(mergedDates, otherPeriod.dates);

			if (conflicts.length > 0) {
				// Remove conflicting dates from this year period
				const updatedDates = removeDatesFromArray(otherPeriod.dates, conflicts);
				await yearPeriods.updateById(otherPeriod._id, { dates: updatedDates });
			}
		}

		//
		// Return the merged dates

		return mergedDates;

		//
	}
	//
}
