/* * */

import { findCommonDates, mergeDateArrays, removeDatesFromArray } from '@tmlmobilidade/dates';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type Permission, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';

/* * */

interface YearPeriodDateAssignmentArgs {
	actorId: string
	agencyIds: string[]
	existingDates?: OperationalDate[]
	newDates: OperationalDate[]
	userPermissions: Permission[]
	yearPeriodId?: string
}

type YearPeriodDateAssignmentResult = { dates: OperationalDate[], error?: never } | { dates?: never, error: { error: string, status_code: '403' | '409' } };

/* * */

/**
 * Merges assignment dates and removes overlaps from periods sharing any operator.
 * A period has one shared dates array: changing [A, B] affects both operators.
 * Validate every affected period's lock and update permission before any writes.
 */
export async function handleYearPeriodDateAssignment({ actorId, agencyIds, existingDates = [], newDates, userPermissions, yearPeriodId }: YearPeriodDateAssignmentArgs): Promise<YearPeriodDateAssignmentResult> {
	//

	//
	// Find all overlapping periods for any shared operator

	const mergedDates = mergeDateArrays(existingDates, newDates);
	const query: Filter<YearPeriod> = { agency_ids: { $in: agencyIds } };
	if (yearPeriodId) query._id = { $ne: yearPeriodId };
	const periods = await goDb.offer.yearPeriods.findMany(query);
	const conflicts = periods
		.filter(period => period._id !== yearPeriodId && period.agency_ids.some(id => agencyIds.includes(id)))
		.map(period => ({ dates: findCommonDates(mergedDates, period.dates ?? []), period }))
		.filter(conflict => conflict.dates.length > 0);

	//
	// Preflight every conflict before changing any period

	for (const { period } of conflicts) {
		if (period.is_locked) {
			return { error: { error: `YearPeriod ${period._id} is locked. Unlock it before reassigning its dates.`, status_code: '409' } };
		}
		if (!PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.year_periods.actions.update,
			permissions: userPermissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.year_periods.scope,
			value: period.agency_ids,
		})) {
			return { error: { error: 'You must have update permission for every operator of each conflicting period.', status_code: '403' } };
		}
	}

	//
	// Apply the authorized removals, preserving the authenticated audit actor

	for (const { dates, period } of conflicts) {
		await goDb.offer.yearPeriods.updateById(period._id, {
			dates: removeDatesFromArray(period.dates ?? [], dates),
			updated_by: actorId,
		});
	}
	return { dates: mergedDates };
}
