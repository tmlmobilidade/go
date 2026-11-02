/* * */

import { GtfsValidatiorRuleSchema, GtfsValidatorRuleIdSchema } from '@tmlmobilidade/go-types-gtfs-validator';
import { z } from 'zod';
/* * */

export const AgencyPlansSchema = z.object({
	apex_notification_emails: z.array(z.string().email()).default([]),
	approval_notification_emails: z.array(z.string().email()).default([]),
	approval_request_emails: z.array(z.string().email()).default([]),
	validation_rules: z.record(GtfsValidatorRuleIdSchema, GtfsValidatiorRuleSchema),
});

export type AgencyPlans = z.infer<typeof AgencyPlansSchema>;
