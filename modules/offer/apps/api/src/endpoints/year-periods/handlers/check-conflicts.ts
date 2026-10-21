/* * */

import { findCommonDates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type YearPeriodsConflictsRequest, YearPeriodsConflictsRequestSchema, type YearPeriodsConflictsResponse } from '@tmlmobilidade/go-offer-pckg-types';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';

//

import { haveSameAgencies } from '../utils/same-agencies.js';

/**
 * Check for date conflicts with existing periods.
 * Returns information about which periods would be affected by assigning the given dates.
 * @param request Fastify request containing dates and optional period_id
 * @param reply Fastify reply
 */
export async function checkYearPeriodsConflictsHandler(request: FastifyRequest<{ Body: YearPeriodsConflictsRequest }>, reply: FastifyReply<YearPeriodsConflictsResponse>) {
	//

	//
	// Validate the client contract before permissions or assignment side effects.

	const validatedRequest = YearPeriodsConflictsRequestSchema.safeParse(request.body);

	if (!validatedRequest.success) {
		return sendErrorApiResponse(reply, {
			error: validatedRequest.error.message,
			status_code: '400',
		});
	}

	//
	// Get the resource permissions for year periods for the current user.

	const userYearPeriodPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.year_periods.scope, PermissionCatalog.all.year_periods.actions.read);

	//
	// If no permission found, deny access

	if (!userYearPeriodPermissions) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read year periods',
			status_code: '403',
		});
	}

	//
	// Validate that user has permission for ALL specified agencies

	if (!PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.year_periods.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: validatedRequest.data.agency_ids,
	})) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read these year periods.',
			status_code: '403',
		});
	}

	//
	// Find all periods that have at least one matching agency (excluding the current period if provided)

	const query: Filter<YearPeriod> = {
		agency_ids: { $in: validatedRequest.data.agency_ids },
	};
	if (validatedRequest.data.year_period_id) {
		query._id = { $ne: validatedRequest.data.year_period_id };
	}

	const agencyPeriods = await goDb.offer.yearPeriods.findMany(query);

	//
	// Helper function to check if two agency arrays are exactly the same (regardless of order)

	//
	// Find conflicts
	// A conflict only occurs when EXACTLY the same set of agencies is used
	// Different agency combinations can coexist on the same dates

	const conflicts: { dates: OperationalDate[], year_period: YearPeriod }[] = [];

	for (const otherPeriod of agencyPeriods) {
		if (!otherPeriod.dates || otherPeriod.dates.length === 0) continue;

		// Only consider it a conflict if the agency sets are EXACTLY the same
		if (!haveSameAgencies(validatedRequest.data.agency_ids, otherPeriod.agency_ids)) continue;

		// Find dates that conflict between the new dates and this year period
		const conflictingDates = findCommonDates(validatedRequest.data.dates, otherPeriod.dates);

		if (conflictingDates.length > 0) {
			conflicts.push({
				dates: conflictingDates,
				year_period: otherPeriod,
			});
		}
	}

	//
	// Return conflicts

	return sendSuccessApiResponse(reply, { conflicts });

	//
}
