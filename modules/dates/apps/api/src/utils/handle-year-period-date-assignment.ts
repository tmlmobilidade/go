/* * */

import { findCommonDates, mergeDateArrays, removeDatesFromArray } from '@tmlmobilidade/dates';
import { type Filter } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type OperationalDate } from '@tmlmobilidade/go-types-shared';

import { areAgencySetsEqual } from './are-agency-sets-equal.js';

/* * */

interface HandleYearPeriodDateAssignmentArgs {
	agencyIds: string[]
	existingDates?: OperationalDate[]
	newDates: OperationalDate[]
	yearPeriodId?: string
}

/**
 * Handles the assignment of dates to a Year Period with conflict resolution.
 * Merges the new dates with the existing dates and removes the conflicting dates
 * from the other Year Periods that have the EXACT same agency set.
 * @param args.agencyIds The agency IDs of the Year Period being assigned
 * @param args.newDates The new dates to assign
 * @param args.yearPeriodId Optional Year Period ID to exclude from conflict resolution (for updates)
 * @param args.existingDates Optional existing dates to merge with
 * @returns The merged dates array
 */
export async function handleYearPeriodDateAssignment({ agencyIds, existingDates = [], newDates, yearPeriodId }: HandleYearPeriodDateAssignmentArgs): Promise<OperationalDate[]> {
	//

	//
	// Merge the new dates with the existing dates, if any

	const mergedDates = existingDates.length > 0 ? mergeDateArrays(existingDates, newDates) : newDates;

	//
	// Find all the year periods that share at least one agency,
	// excluding the current year period if provided

	const query: Filter<YearPeriod> = {
		agency_ids: { $in: agencyIds },
	};

	if (yearPeriodId) {
		query._id = { $ne: yearPeriodId };
	}

	const agencyYearPeriods = await goDb.offer.yearPeriods.findMany(query);

	//
	// Remove the conflicting dates from each year period
	// that has the EXACT same agency set and overlapping dates

	for (const otherYearPeriod of agencyYearPeriods) {
		if (!otherYearPeriod.dates || otherYearPeriod.dates.length === 0) continue;
		if (!areAgencySetsEqual(agencyIds, otherYearPeriod.agency_ids)) continue;
		const conflictingDates = findCommonDates(mergedDates, otherYearPeriod.dates);
		if (conflictingDates.length === 0) continue;
		const updatedDates = removeDatesFromArray(otherYearPeriod.dates, conflictingDates);
		await goDb.offer.yearPeriods.updateById(otherYearPeriod._id, { dates: updatedDates });
	}

	//
	// Return the merged dates

	return mergedDates;
}
