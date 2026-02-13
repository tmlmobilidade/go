import type { IsoWeekday } from '@tmlmobilidade/types';

import { CalendarKey } from '@tmlmobilidade/dates';

/**
 * Represents the result of applying rules to a specific date.
 * Contains the time points that should be active, which rules were applied,
 * and whether this date is controlled by an event override.
 */
export interface RuleApplication {
	/** IDs of all rules that were applied to determine this result */
	appliedRuleIds: string[]
	/** True if this date is controlled by an event replacement rule */
	isEventOverride: boolean
	/** Array of time points (HH:MM format) that are active on this date */
	timePoints: string[]
}

/**
 * Map from calendar date keys to their rule application results.
 * Used to efficiently look up which time points are active on any given date.
 */
export type RuleApplicationMap = Map<CalendarKey, RuleApplication>;

/**
 * Minimal context needed to determine which manual rules apply to a specific day.
 * Contains only the period and weekday - enough to match against manual rule criteria.
 */
export interface DayContext {
	/** The active period ID for this day (e.g., school term, summer, etc.) */
	periodId: string
	/** ISO weekday number (1=Monday, 7=Sunday) */
	weekday: IsoWeekday
}
