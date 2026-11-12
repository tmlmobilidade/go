/* * */

import { type GtfsValidatorRuleId } from './rule-ids.js';
import { type GtfsValidatiorRule } from './rule.js';

/* * */

/** Editable settings retain an unselected severity until strict save validation. */
export type GtfsValidatorRuleDraft = Omit<GtfsValidatiorRule, 'severity'> & {
	severity?: GtfsValidatiorRule['severity']
};

export type GtfsValidatorRulesDraft = Partial<Record<GtfsValidatorRuleId, GtfsValidatorRuleDraft>>;
