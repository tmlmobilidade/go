/* * */

import { SchoolSchema } from '@tmlmobilidade/go-types-operation';
import { z } from 'zod';

/* * */

export const SchoolsListItemSchema = SchoolSchema.pick({
	_id: true,
	created_at: true,
	created_by: true,
	updated_at: true,
	updated_by: true,
});

/* * */

/**
 * A read model for the alert list item.
 */
export type SchoolsListItem = z.infer<typeof SchoolsListItemSchema>;
