import { type GtfsStrictV29Period, GtfsStrictV29PeriodSchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type OperationalDateInt } from '@tmlmobilidade/go-types-shared';

/* * */

/** Resolve agency-owned period codes, using the service's selected periods to disambiguate overlaps. */
export function createV29PeriodResolver(
	agencyId: string,
	periods: Iterable<YearPeriod>,
): (date: OperationalDateInt, periodIds?: readonly string[]) => GtfsStrictV29Period {
	const agencyPeriods = Array.from(periods).filter(period => period.agency_ids.includes(agencyId));
	const codedPeriods = agencyPeriods.map((period) => {
		const code = GtfsStrictV29PeriodSchema.safeParse(period.code);
		if (!code.success) {
			throw new Error(`GTFS v29: Period ${period._id} for agency ${agencyId} requires a nonblank code`);
		}
		return { code: code.data, period };
	});

	return (date, periodIds) => {
		for (const periodId of periodIds ?? []) {
			if (!codedPeriods.some(({ period }) => period._id === periodId)) {
				throw new Error(`GTFS v29: Period ${periodId} is missing or outside agency ${agencyId}`);
			}
		}
		const selectedPeriods = periodIds?.length
			? codedPeriods.filter(({ period }) => periodIds.includes(period._id))
			: codedPeriods;
		// A rule selecting one period defines its code even on event replacement dates
		// outside that period's ordinary calendar.
		if (periodIds?.length && selectedPeriods.length === 1) return selectedPeriods[0].code;

		const matches = selectedPeriods.filter(({ period }) => period.dates?.includes(date));
		const codes = [...new Set(matches.map(({ code }) => code))];
		if (codes.length > 1) {
			throw new Error(`GTFS v29: conflicting Periods for agency ${agencyId} on ${date}: ${matches.map(({ period }) => period._id).join(', ')}`);
		}

		const [code] = codes;
		if (!code) {
			throw new Error(`GTFS v29: no Period for agency ${agencyId} on ${date}`);
		}
		return code;
	};
}
