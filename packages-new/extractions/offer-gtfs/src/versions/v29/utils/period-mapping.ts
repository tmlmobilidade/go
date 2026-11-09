import { type GtfsStrictV29Period, GtfsStrictV29PeriodValues } from '@tmlmobilidade/go-types-gtfs-strict';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

/**
 * Temporary v29 numbering, built once per agency per export.
 * Sort by required business code, then ID for duplicate codes; assign 1, 2, 3.
 * Numbers identify the agency's periods, not school/holiday/summer categories.
 * Adding/removing periods or changing their codes can change subsequent numbers.
 * Keep this out of the shared Period model: later GTFS versions need not require it.
 */
export function createV29PeriodResolver(
	agencyId: string,
	periods: Iterable<YearPeriod>,
): (date: OperationalDateInt) => GtfsStrictV29Period {
	const agencyPeriods = Array.from(periods).filter(period => period.agency_ids.includes(agencyId));
	if (agencyPeriods.length > GtfsStrictV29PeriodValues.length) {
		throw new Error(`GTFS v29: agency ${agencyId} has ${agencyPeriods.length} Periods; at most 3 can be numbered`);
	}

	for (const period of agencyPeriods) {
		if (!period.code?.trim()) {
			throw new Error(`GTFS v29: Period ${period._id} for agency ${agencyId} requires a nonblank code for numbering`);
		}
	}

	// Compare without locale-dependent collation, preserving order across export hosts.
	agencyPeriods.sort((left, right) => {
		const leftCode = left.code.trim();
		const rightCode = right.code.trim();
		if (leftCode !== rightCode) return leftCode < rightCode ? -1 : 1;
		return left._id < right._id ? -1 : left._id > right._id ? 1 : 0;
	});

	const numberedPeriods = agencyPeriods.map((period, index) => {
		const number = GtfsStrictV29PeriodValues[index];
		if (!number) throw new Error(`GTFS v29: no period number available for agency ${agencyId}`);
		return { number, period };
	});

	return (date) => {
		const matches = numberedPeriods.filter(({ period }) => period.dates?.includes(date));
		if (matches.length > 1) {
			throw new Error(`GTFS v29: conflicting Periods for agency ${agencyId} on ${date}: ${matches.map(({ period }) => period._id).join(', ')}`);
		}

		const [match] = matches;
		if (!match) {
			throw new Error(`GTFS v29: no Period for agency ${agencyId} on ${date}`);
		}
		return match.number;
	};
}
