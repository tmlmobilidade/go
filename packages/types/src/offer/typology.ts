/* * */

import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const TypologySchema = DocumentSchema.extend({
	agency_ids: z.array(z.string()).min(1, 'At least one agency ID is required'),
	code: z.string().trim().min(1).max(10),
	color: z.string().trim().min(1).max(7), // Hex color code
	default_onboard_fare_ids: z.array(z.string()).nullable().default(null),
	default_prepaid_fare_id: z.string().nullable().default(null),
	is_locked: z.boolean().default(false),
	name: z.string().trim().min(1).max(50),
	text_color: z.string().trim().min(1).max(7), // Hex color code
});

/* * */

// Only name, code, and agency_ids are required for creation
export const CreateTypologySchema = z.object({
	agency_ids: TypologySchema.shape.agency_ids,
	code: TypologySchema.shape.code,
	name: TypologySchema.shape.name,
}).merge(
	TypologySchema.omit({
		agency_ids: true,
		code: true,
		created_at: true,
		name: true,
		updated_at: true,
	}).partial(),
);

export const UpdateTypologySchema = CreateTypologySchema
	.omit({ created_by: true })
	.partial();

/* * */

export type Typology = z.infer<typeof TypologySchema>;
export type CreateTypologyDto = z.infer<typeof CreateTypologySchema>;
export type UpdateTypologyDto = z.infer<typeof UpdateTypologySchema>;
