/* * */

import { z } from 'zod';

/* * */

export const AgencyPlansSchema = z.object({
	approval_notification_emails: z.array(z.string().email()).default([]),
	approval_request_emails: z.array(z.string().email()).default([]),
	validation_rules: z.any().nullable().default(null),
});

export type AgencyPlans = z.infer<typeof AgencyPlansSchema>;
