/* * */

import { SeverityStatusValues } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { GtfsValidationOutputMessageSchema, GtfsValidationOutputRuleMessageSchema, GtfsValidationOutputSummarySchema } from './output/index.js';
import { GtfsValidatiorRuleSchema, GtfsValidatorRuleIdSchema } from './rules/index.js';

/* * */

const severity = z.string().transform(value => value.toLowerCase()).pipe(z.enum([...SeverityStatusValues, 'forbidden']));

/** Configuration for one rule in the Go validator's rules array. */
export const GtfsValidatorCliRuleSchema = GtfsValidatiorRuleSchema.extend({
	depends_on: GtfsValidatorRuleIdSchema.array().optional(),
	rule_id: GtfsValidatorRuleIdSchema,
	severity,
});

export type GtfsValidatorCliRule = z.infer<typeof GtfsValidatorCliRuleSchema>;

const detailMessage = GtfsValidationOutputMessageSchema.extend({ severity });
const ruleMessage = GtfsValidationOutputRuleMessageSchema.extend({
	messages: detailMessage.array(),
	severity,
	total_rows: z.number(),
});

/** Report emitted by a completed Go validator run. */
export const GtfsValidatorCliSummarySchema = GtfsValidationOutputSummarySchema.extend({
	messages: ruleMessage.array(),
});

export type GtfsValidatorCliSummary = z.infer<typeof GtfsValidatorCliSummarySchema>;
