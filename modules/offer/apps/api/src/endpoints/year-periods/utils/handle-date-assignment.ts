/* * */

import { findCommonDates, mergeDateArrays, removeDatesFromArray } from '@tmlmobilidade/dates';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';

import { haveSameAgencies } from './same-agencies.js';

/**
 * Utility function to handle date assignment with conflict resolution.
 * Merges new dates with existing dates and removes conflicts from other year periods with the EXACT same agency set.
 * @param agencyIds - Array of agency IDs
 * @param newDates - Array of new dates to assign
 * @param actorId - Authenticated actor responsible for assignment changes
 * @param yearPeriodId - Optional period ID to exclude from conflict resolution (for updates)
 * @param existingDates - Optional array of existing dates to merge with
 * @returns The merged dates array
 */
export async function handleYearPeriodDateAssignment(
	agencyIds: string[],
	newDates: OperationalDate[],
	actorId: string,
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

	const agencyPeriods = await goDb.offer.yearPeriods.findMany(query);

	//
	// Helper function to check if two agency arrays are exactly the same (regardless of order)

	//
	// For each year period with EXACT same agency set and overlapping dates, remove the conflicting dates

	for (const otherPeriod of agencyPeriods) {
		if (!otherPeriod.dates || otherPeriod.dates.length === 0) continue;

		// Only handle conflicts for year periods with EXACTLY the same agency set
		if (!haveSameAgencies(agencyIds, otherPeriod.agency_ids)) continue;

		// Find dates that conflict between the merged dates and this year period
		const conflicts = findCommonDates(mergedDates, otherPeriod.dates);

		if (conflicts.length > 0) {
			// Remove conflicting dates from this year period
			const updatedDates = removeDatesFromArray(otherPeriod.dates, conflicts);
			await goDb.offer.yearPeriods.updateById(otherPeriod._id, { dates: updatedDates, updated_by: actorId });
		}
	}

	//
	// Return the merged dates

	return mergedDates;

	//
}
