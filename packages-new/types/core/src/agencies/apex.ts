/* * */

import { z } from 'zod';

/* * */

export const AgencyApexSchema = z.object({
	contact_emails: z.array(z.string().email()).default([]),
});

/* * */

export type AgencyApex = z.infer<typeof AgencyApexSchema>;
