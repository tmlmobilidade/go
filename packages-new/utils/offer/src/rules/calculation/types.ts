import type { IsoWeekday } from '@tmlmobilidade/go-types-shared';

/**
 * Represents the result of applying rules to a specific date.
 * Contains the time points that should be active, which rules were applied,
 * and whether this date is controlled by an event override.
 */
export interface RuleApplication {
	/** IDs of all rules that were applied to determine this result */
	appliedRuleIds: string[]
	/** Array of time points (HH:MM format) that are active on this date */
	timepoints: string[]
}

/**
 * Minimal context needed to determine which manual rules apply to a specific day.
 * Contains only the period and weekday - enough to match against manual rule criteria.
 */
export interface DayContext {
	/** ISO weekday number (1=Monday, 7=Sunday) */
	weekday: IsoWeekday
	/** First active period, retained for callers supplying a single-period context. */
	yearPeriodId: string
	/** Every period covering this date, including overlapping annual and school calendars. */
	yearPeriodIds?: readonly string[]
}
