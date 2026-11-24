/* * */

import { BaseDocumentSchema, partialWithoutDefaults } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const StopAreaSchema = BaseDocumentSchema.extend({
	_id: z.string(),
	parent_station_ids: z.array(z.string()),
});

export const CreateStopAreaSchema = StopAreaSchema.omit({ _id: true, created_at: true, updated_at: true });
export const UpdateStopAreaSchema = partialWithoutDefaults(CreateStopAreaSchema.omit({ created_by: true }));

export type StopArea = z.infer<typeof StopAreaSchema>;
export type CreateStopAreaDto = z.infer<typeof CreateStopAreaSchema>;
export type UpdateStopAreaDto = z.infer<typeof UpdateStopAreaSchema>;
