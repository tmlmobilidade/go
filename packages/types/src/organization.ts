/* * */

import { DocumentSchema } from '@/_common/document.js';
import { z } from 'zod';

/* * */

export const HomeLinkSchema = z.object({
	href: z.string().url(),
	icon: z.string(),
	order: z.number().min(0),
	title: z.string(),
});

export type HomeLink = z.infer<typeof HomeLinkSchema>;

/* * */

export const OrganizationSchema = DocumentSchema.extend({
	home_links: z.array(HomeLinkSchema).default([]),
	home_wikis: z.array(z.string()).default([]),
	logo_dark: z.string().nullish(),
	logo_light: z.string().nullish(),
	long_name: z.string(),
	short_name: z.string(),
	theme: z.string().nullish(),
}).strict();

export const CreateOrganizationSchema = OrganizationSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateOrganizationSchema = CreateOrganizationSchema.omit({ created_by: true }).partial();

export type Organization = z.infer<typeof OrganizationSchema>;
export type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationSchema>;
