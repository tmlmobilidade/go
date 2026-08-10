import type { DayContext } from '../calculation/types.js';

import { EventReplacementRule, HHMM, ManualRule } from '@tmlmobilidade/types';

import { manualRuleMatchesContext, manualRuleMatchesReplacement } from '../calculation/matchers.js';

export interface ManualRuleTimepoints {
	rule: ManualRule
	timepoints: HHMM[]
}

/**
 * Per-rule variant of `collectManualIncludes` (calculation) for GTFS token attribution.
 *
 * Returns one entry per matching manual instead of merging timepoints into a single set.
 */
export function collectManualIncludesByRule(
	manualRules: ManualRule[],
	ctx: DayContext,
): ManualRuleTimepoints[] {
	const result: ManualRuleTimepoints[] = [];

	for (const rule of manualRules) {
		if (rule.operating_mode !== 'include') continue;
		if (!manualRuleMatchesContext(rule, ctx)) continue;

		result.push({
			rule,
			timepoints: (rule.timepoints ?? []) as HHMM[],
		});
	}

	return result;
}

/**
 * Per-rule variant of `collectReplacementManualIncludes` (calculation) for GTFS token attribution.
 */
export function collectReplacementManualIncludesByRule(
	replacement: EventReplacementRule,
	manualRules: ManualRule[],
): ManualRuleTimepoints[] {
	const result: ManualRuleTimepoints[] = [];

	for (const rule of manualRules) {
		if (rule.operating_mode !== 'include') continue;
		if (!manualRuleMatchesReplacement(rule, replacement)) continue;

		result.push({
			rule,
			timepoints: (rule.timepoints ?? []) as HHMM[],
		});
	}

	return result;
}
