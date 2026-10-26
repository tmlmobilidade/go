/* * */

import { StopSchema } from '@tmlmobilidade/go-types-infrastructure';
import { z } from 'zod';

/* * */

export const StopsUpdateRequestSchema = StopSchema.omit({
	_id: true,
	associated_patterns: true,
	created_at: true,
	created_by: true,
	file_ids: true,
	image_ids: true,
	is_deleted: true,
	is_locked: true,
	latitude: true,
	location: true,
	longitude: true,
	name: true,
	short_name: true,
	tts_hash: true,
	tts_name: true,
	updated_at: true,
	updated_by: true,
});

export type StopsUpdateRequest = z.infer<typeof StopsUpdateRequestSchema>;
