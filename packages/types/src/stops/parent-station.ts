/* * */

import { DocumentSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const ParentStationSchema = DocumentSchema.extend({
	_id: z.string(),
	stop_ids: z.array(z.string()),
	title: z.string(),
});

export const CreateParentStationSchema = ParentStationSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateParentStationSchema = CreateParentStationSchema.omit({ created_by: true }).partial();

export type ParentStation = z.infer<typeof ParentStationSchema>;
export type CreateParentStationDto = z.infer<typeof CreateParentStationSchema>;
export type UpdateParentStationDto = z.infer<typeof UpdateParentStationSchema>;
