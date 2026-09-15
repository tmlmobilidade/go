/* * */

import { areAgencySetsEqual } from '@/utils/are-agency-sets-equal.js';
import { findCommonDates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';

/* * */

interface CheckConflictsBody {
	agency_ids: string[]
	dates: OperationalDate[]
	year_period_id?: string
}

interface CheckConflictsResult {
	conflicts: { dates: OperationalDate[], year_period: YearPeriod }[]
}

/**
 * Checks for date conflicts with the existing Year Periods.
 * Returns the Year Periods that would be affected by assigning the given dates to the given agency set.
 * @param request The request object
 * @param reply The reply object
 */
export async function checkConflictsHandler(request: FastifyRequest<{ Body: CheckConflictsBody }>, reply: FastifyReply<CheckConflictsResult>) {
	//

	//
	// Check if the user has permission for all the specified agencies

	const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
		action: PermissionCatalog.all.year_periods.actions.read,
		permissions: request.permissions,
		resource_key: 'agency_ids',
		scope: PermissionCatalog.all.year_periods.scope,
		value: request.body.agency_ids,
	});

	if (!hasPermissionForAllAgencies) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to read periods for all specified agencies',
			status_code: '403',
		});
	}

	//
	// Find all the year periods that share at least one agency,
	// excluding the current year period if provided

	const query: Filter<YearPeriod> = {
		agency_ids: { $in: request.body.agency_ids },
	};

	if (request.body.year_period_id) {
		query._id = { $ne: request.body.year_period_id };
	}

	const agencyYearPeriods = await goDb.offer.yearPeriods.findMany(query);

	//
	// Find the conflicts. A conflict only occurs when EXACTLY the same set
	// of agencies is used. Different agency combinations can coexist on the same dates.

	const conflicts: CheckConflictsResult['conflicts'] = [];

	for (const otherYearPeriod of agencyYearPeriods) {
		if (!otherYearPeriod.dates || otherYearPeriod.dates.length === 0) continue;
		if (!areAgencySetsEqual(request.body.agency_ids, otherYearPeriod.agency_ids)) continue;
		const conflictingDates = findCommonDates(request.body.dates, otherYearPeriod.dates);
		if (conflictingDates.length === 0) continue;
		conflicts.push({
			dates: conflictingDates,
			year_period: otherYearPeriod,
		});
	}

	return sendSuccessApiResponse(reply, { conflicts });
}
