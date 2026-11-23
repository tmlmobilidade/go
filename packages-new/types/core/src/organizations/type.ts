import { z } from 'zod';

export const OrganizationTypeSchema = z.enum([
	'agency',
	'cim',
	'metropolitan_area',
	'autonomous_region',
	'municipality',
	'transport_authority',
	'transport_network',
	'other',
]);

export type OrganizationType = z.infer<typeof OrganizationTypeSchema>;
