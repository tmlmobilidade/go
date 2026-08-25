/* * */
import { DocumentSchema, PublishStatusSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const SchoolSchema = DocumentSchema.extend({
	_id: z.string(),
	address: z.string(),
	agency_id: z.string(),
	artistic: z.boolean().default(false),
	basic_1: z.boolean().default(false),
	basic_2: z.boolean().default(false),
	basic_3: z.boolean().default(false),
	code: z.string().default(''),
	coordinates: z.tuple([z.number(), z.number()]).nullable().default(null),
	district_id: z.string(),
	district_name: z.string(),
	email: z.string(),
	grouping: z.string(),
	high_school: z.boolean().default(false),
	is_active: z.boolean().default(false),
	is_deleted: z.boolean().default(false),
	locality: z.string(),
	municipality_id: z.string(),
	municipality_name: z.string(),
	name: z.string(),
	nature: z.string(),
	other: z.boolean().default(false),
	parish_name: z.string(),
	postal_code: z.string(),
	pre_school: z.boolean().default(false),
	professional: z.boolean().default(false),
	publish_status: PublishStatusSchema.default('draft'),
	region_id: z.string(),
	region_name: z.string(),
	special: z.boolean().default(false),
	stops: z.array(z.string()).default([]),
	university: z.boolean().default(false),
	url: z.union([z.string().url(), z.literal('')]).nullable().default(null),
	validation_date: UnixTimestampSchema.nullable().default(null),
});

export const CreateSchoolSchema = SchoolSchema.omit({ _id: true, created_at: true, created_by: true, updated_at: true, updated_by: true });
export const UpdateSchoolSchema = CreateSchoolSchema.partial();

export type School = z.infer<typeof SchoolSchema>;
export type CreateSchoolDto = z.infer<typeof CreateSchoolSchema>;
export type UpdateSchoolDto = z.infer<typeof UpdateSchoolSchema>;
