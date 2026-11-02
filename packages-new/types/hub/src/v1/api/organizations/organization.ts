import { OrganizationSchema } from '@tmlmobilidade/go-types-core';
import { z } from 'zod';

export const HubV1ApiOrganizationSchema = OrganizationSchema.pick({
	_id: true,
	agency_ids: true,
	long_name: true,
	open_data: true,
	short_name: true,
});

export type HubV1ApiOrganization = z.infer<typeof HubV1ApiOrganizationSchema>;
