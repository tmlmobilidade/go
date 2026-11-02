/* * */

import { z } from 'zod';

import { OrganizationSchema } from '../organizations/organization.js';

/* * */

export const AgencyOrganizationSchema = OrganizationSchema.pick({
	_id: true,
	agency_ids: true,
	long_name: true,
	short_name: true,
});

export type AgencyOrganization = z.infer<typeof AgencyOrganizationSchema>;
