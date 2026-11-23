/* * */

import { type GtfsValidatorCliRule } from '../cli.js';
import { type GtfsValidatorRuleId } from './rule-ids.js';

/* * */

/** Editable settings retain an unselected severity until strict save validation. */
export type GtfsValidatorRuleDraft = Omit<GtfsValidatorCliRule, 'rule_id' | 'severity'> & {
	severity?: GtfsValidatorCliRule['severity']
};

export type GtfsValidatorRulesDraft = Partial<Record<GtfsValidatorRuleId, GtfsValidatorRuleDraft>>;
