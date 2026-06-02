import type { HHMM, ScheduleRule } from '@tmlmobilidade/types';

/** How a rule binds to a timepoint in GTFS export. */
export type GtfsIncludeContributionKind = 'base_off' | 'operating';

/**
 * One rule × timepoint binding for GTFS `trips.txt` / `calendar_dates.txt`.
 *
 * - `operating` — active include row for `rule` on `timepoint`.
 * - `base_off` — `rule` stays in the calendar definition but is off on this date;
 *   `excludeRule` is what displaces it (event manual or replacement).
 */
export interface GtfsIncludeContribution {
	/** Present when `kind` is `base_off`: the rule that displaces `rule`. */
	excludeRule?: ScheduleRule
	kind: GtfsIncludeContributionKind
	rule: ScheduleRule
	timepoint: HHMM
}
