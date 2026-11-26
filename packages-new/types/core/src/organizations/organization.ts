/* * */

import { HomeQuickLinkSchema } from '@/home/quick-link.js';
import { GeoJsonFeatureCollectionSchema } from '@tmlmobilidade/go-types-geo';
import { BaseDocumentSchema, partialWithoutDefaults } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

import { OrganizationContactSchema } from './contact.js';
import { OrganizationOpenDataSchema } from './open-data.js';
import { OrganizationTypeSchema } from './type.js';

/* * */

export const OrganizationSchema = BaseDocumentSchema.extend({
	agency_ids: z.array(z.string()).default([]),
	contacts: z.array(OrganizationContactSchema).default([]),
	geojson: GeoJsonFeatureCollectionSchema().nullable().default(null),
	home_links: z.array(HomeQuickLinkSchema).default([]),
	home_wikis: z.array(z.string()).default([]),
	logo_dark: z.string().nullable().default(null),
	logo_light: z.string().nullable().default(null),
	long_name: z.string().min(1),
	open_data: OrganizationOpenDataSchema,
	organization_type: OrganizationTypeSchema.default('other'),
	short_name: z.string().min(1).max(6),
	theme: z.string().nullable().default(null),
	website_url: z.url().nullable().default(null),
});

export const CreateOrganizationSchema = OrganizationSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateOrganizationSchema = partialWithoutDefaults(CreateOrganizationSchema.omit({ created_by: true }));

export type Organization = z.infer<typeof OrganizationSchema>;
export type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationSchema>;
