/* * */

import { OrganizationSchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

/* * */

export const OrganizationFilterSchema = OrganizationSchema.pick({
	_id: true,
	agency_ids: true,
	long_name: true,
	organization_type: true,
	short_name: true,
});

export type OrganizationFilter = z.infer<typeof OrganizationFilterSchema>;
