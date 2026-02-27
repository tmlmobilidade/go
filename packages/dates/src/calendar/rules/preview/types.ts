import { ScheduleRule } from '@tmlmobilidade/types';

/**
 * Detailed rule information for a specific day
 */
export interface DayRuleDetail {
	/** All timepoints this rule defines (not filtered by exclusions) */
	allTimePoints: string[]
	/** The rule object */
	rule: ScheduleRule
	/** Type of rule for display grouping */
	type: 'exclude' | 'include' | 'replacement'
}

/**
 * Detailed schedule information for a specific day
 */
export interface DayScheduleDetail {
	/** Map of timepoint -> rule that excluded it (for showing crossed-out times) */
	excludedTimePoints: Map<string, ScheduleRule>
	/** Exclude rules with their timepoints */
	excludeRules: DayRuleDetail[]
	/** Final timepoints active on this day (after all rules applied) */
	finalTimePoints: string[]
	/** Include rules with their full schedules */
	includeRules: DayRuleDetail[]
	/** Replacement rules (event overrides) */
	replacementRules: DayRuleDetail[]
}
