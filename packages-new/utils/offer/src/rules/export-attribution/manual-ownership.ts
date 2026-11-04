import { type ManualRule } from '@tmlmobilidade/go-types-offer';

/* * */

const ALL_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
const ALL_MONTHS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

function isSubsetOf(inner: readonly (number | string)[], outer: readonly (number | string)[]): boolean {
	const set = new Set(outer);
	return inner.every(x => set.has(x));
}

/**
 * Compare declared weekday/month/period scopes for ownership ordering only.
 * Empty dimensions are treated as unbounded here. This is not a date matcher:
 * collectors establish eligibility first, and ordinary manual rules still require
 * explicit weekdays and periods. Event membership is handled before attribution.
 */
function containsManualCalendarScope(outer: ManualRule, inner: ManualRule): boolean {
	const outerWeekdays = outer.weekdays?.length ? outer.weekdays : ALL_WEEKDAYS;
	const innerWeekdays = inner.weekdays?.length ? inner.weekdays : ALL_WEEKDAYS;
	if (!isSubsetOf(innerWeekdays, outerWeekdays)) return false;

	const outerMonths = outer.months?.length ? outer.months : ALL_MONTHS;
	const innerMonths = inner.months?.length ? inner.months : ALL_MONTHS;
	if (!isSubsetOf(innerMonths, outerMonths)) return false;

	// Empty year_period_ids = all periods (open-ended universe). An empty outer covers every
	// period; an empty inner is only contained by an empty outer.
	if (!outer.year_period_ids?.length) return true;
	if (!inner.year_period_ids?.length) return false;
	return isSubsetOf(inner.year_period_ids, outer.year_period_ids);
}

/**
 * Ownership order for overlapping general manuals (ND-03).
 *
 * When one rule's applicable dates strictly contain the other's (e.g. an "all days" rule vs a
 * "weekdays" rule sharing a timepoint), the **broader** rule owns the shared timepoint so its
 * date set stays whole and the export emits one clean token instead of fragmenting across two
 * (`ALL` + `ALL_DU`). We only override on true containment — for equal or partially-overlapping
 * scopes the choice is genuinely ambiguous, so the primary schedule (more timepoints, then `_id`)
 * wins, exactly as before.
 *
 * @returns Negative if `a` should sort before `b` (i.e. `a` owns the shared timepoint).
 */
export function compareGeneralManualOwnershipPriority(a: ManualRule, b: ManualRule): number {
	const aContainsB = containsManualCalendarScope(a, b);
	const bContainsA = containsManualCalendarScope(b, a);
	if (aContainsB && !bContainsA) return -1; // a strictly broader → a owns
	if (bContainsA && !aContainsB) return 1; // b strictly broader → b owns

	const aCount = a.timepoints?.length ?? 0;
	const bCount = b.timepoints?.length ?? 0;
	if (aCount !== bCount) return bCount - aCount;

	return (a._id ?? '').localeCompare(b._id ?? '');
}

